const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let allData = []; // Store all data from all pages

    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(
      "https://satsuitequestionbank.collegeboard.org/digital/search",
      { waitUntil: "networkidle2" }
    );

    // Apply filters
    await page.select("#selectAssessmentType", "99"); // SAT
    await page.select("#selectTestType", "2"); // Math
    await page.click("#checkbox-algebra"); // Algebra filter

    // Click the search button and wait for the results page
    await page.click(".cb-btn.cb-btn-primary");
    await page.waitForFunction('window.location.href.includes("results")');
    await page.waitForSelector("#apricot_table_9 tbody tr"); // Wait for the results table

    let hasNextPage = true;

    while (hasNextPage) {
      const tableRows = await page.$$("#apricot_table_9 tbody tr");

      for (let row of tableRows) {
        try {
          // Scrape row data
          const rowData = await row.evaluate((row) => {
            const columns = Array.from(row.querySelectorAll("td"));
            return {
              id: columns[1]?.innerText.trim(),
              skill: columns[3]?.innerText.trim(),
              skillDescription: columns[4]?.innerText.trim(),
            };
          });

          // Click the button to open the modal
          const button = await row.$(".view-question-button");
          await button.click();

          // Retry logic to ensure modal content is loaded
          let modalLoaded = false;
          for (let attempts = 0; attempts < 3; attempts++) {
            try {
              await page.waitForSelector(".cb-dialog-content .column-content", {
                timeout: 60000,
              });
              modalLoaded = true;
              break;
            } catch (e) {
              console.warn(
                `Attempt ${attempts + 1} to load modal failed. Retrying...`
              );
            }
          }

          if (!modalLoaded) {
            console.error("Failed to load modal content. Skipping row.");
            await page.click(".cb-btn-close");
            await new Promise((resolve) => setTimeout(resolve, 500)); // Ensure modal is closed
            continue;
          }

          // Scrape modal title
          const modalTitle = await page.$eval("#modalTitle", (el) =>
            el.innerText.trim()
          );

          // Scrape additional details (Assessment, Test, Domain, Skill, Difficulty)
          const modalDetails = await page.evaluate(() => {
            const assessment = document
              .querySelector(
                ".question-banner .col-sm:nth-child(1) .column-content"
              )
              ?.innerText.trim();
            const test = document
              .querySelector(
                ".question-banner .col-sm:nth-child(2) .column-content"
              )
              ?.innerText.trim();
            const domain = document
              .querySelector(
                ".question-banner .col-sm:nth-child(3) .column-content"
              )
              ?.innerText.trim();
            const skill = document
              .querySelector(
                ".question-banner .col-sm:nth-child(4) .column-content"
              )
              ?.innerText.trim();
            const difficulty =
              document
                .querySelector(
                  ".question-banner .col-sm:nth-child(5) .column-content span"
                )
                ?.getAttribute("aria-label") || "N/A"; // Use aria-label for difficulty

            return {
              assessment,
              test,
              domain,
              skill,
              difficulty,
            };
          });

          // Scrape the entire question content
          const questionContent = await page.$eval(
            ".question-content.col-xs-12.col-md-6",
            (el) => el.outerHTML.trim()
          );

          // Merge row data with modal details
          allData.push({
            ...rowData,
            modalDetails: {
              title: modalTitle,
              assessment: modalDetails.assessment || "N/A",
              test: modalDetails.test || "N/A",
              domain: modalDetails.domain || "N/A",
              skill: modalDetails.skill || "N/A",
              difficulty: modalDetails.difficulty || "N/A",
              questionContent, // Include the full question content HTML
            },
          });

          // Close the modal
          await page.click(".cb-btn-close");

          // Wait for the modal to fully close
          await new Promise((resolve) => setTimeout(resolve, 500)); // Delay to ensure modal closes
        } catch (rowError) {
          console.error("Error processing row:", rowError);
        }
      }

      // Save data incrementally
      fs.writeFileSync("result.json", JSON.stringify(allData, null, 2));
      console.log("Data saved to result.json.");

      // Check if there is a next page
      const nextButton = await page.$("#undefined_next");
      if (nextButton) {
        const isDisabled = await nextButton.evaluate((btn) =>
          btn.classList.contains("cb-disabled")
        );

        if (isDisabled) {
          hasNextPage = false;
        } else {
          await nextButton.click();
          await page.waitForSelector("#apricot_table_9 tbody tr"); // Wait for the next page to load
        }
      } else {
        hasNextPage = false;
      }
    }

    console.log("Scraping completed. All data saved to result.json.");
    await browser.close();
  } catch (err) {
    console.error("Error scraping data:", err);
  }
})();
