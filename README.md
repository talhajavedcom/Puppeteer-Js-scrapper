

* * *

1\. Initial Setup
-----------------

### Importing Modules

    import puppeteer from "puppeteer";
    import fs from "fs";
    import { filters } from "./filters.js";
    

*   **puppeteer**: Used for browser automation.
*   **fs**: Used for reading and writing JSON files.
*   **filters**: External file containing filter options for the scraper.

### Initializing Variables

    const allData = []; // Store all scraped data
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    

*   **allData**: Holds all scraped data across filters and pages.
*   **sleep**: Helper function to pause execution for a specified number of milliseconds.

* * *

2\. Launching Puppeteer Browser
-------------------------------

### Setting Up the Browser

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 2080 });
    

*   **Browser Launch**: Puppeteer is launched in non-headless mode (visible browser window).
*   **Viewport**: Sets the browser window size to 1080x2080 pixels.

### Navigating to the SAT Suite Website

    await page.goto(
      "https://satsuitequestionbank.collegeboard.org/digital/search",
      { waitUntil: "networkidle2" }
    );
    

*   **URL**: Navigates to the SAT Suite Question Bank search page.
*   **waitUntil**: Ensures all network requests are idle before proceeding.

* * *

3\. Applying Filters
--------------------

### Iterating Through Filters

    for (let data of filters) {
      console.log(data);
      
      // Select assessment and test type
      await page.select("#selectAssessmentType", data.assessment.value);
      await page.select("#selectTestType", data.test.value);
    
      // Apply domain filters
      for (let domain of data.domain) {
        await page.click(domain.id);
      }
    
      // Start search
      await page.click(".cb-btn.cb-btn-primary");
      await page.waitForFunction('window.location.href.includes("results")');
    }
    

*   **Filters**: Loops through the `filters` array to apply each filter.
*   **Assessment & Test Type**: Dropdown selections for assessment (e.g., SAT) and test type (e.g., Math).
*   **Domains**: Applies filters by clicking checkboxes.
*   **Search**: Clicks the search button to navigate to the results page.

* * *

4\. Scraping Results (Paginated)
--------------------------------

### Scraping Table Rows

    const tableRows = await page.$$("#apricot_table_9 tbody tr");
    for (let row of tableRows) {
      const rowData = await row.evaluate((row) => {
        const columns = Array.from(row.querySelectorAll("td"));
        return {
          id: columns[1]?.innerText.trim(),
          question_type: columns[4]?.innerText.trim(),
        };
      });
    }
    

*   **Table Rows**: Selects all rows from the results table.
*   **Data Extraction**: Extracts the `id` and `question_type` from each row.

### Scraping Modal Content

    const button = await row.$(".view-question-button");
    await button.click();
    
    // Retry logic to ensure modal is loaded
    let modalLoaded = false;
    for (let attempts = 0; attempts < 3; attempts++) {
      try {
        await page.waitForSelector(".cb-dialog-content .column-content", {
          timeout: 60000,
        });
        modalLoaded = true;
        break;
      } catch (e) {
        console.warn(`Attempt ${attempts + 1} to load modal failed. Retrying...`);
      }
    }
    if (!modalLoaded) continue; // Skip row if modal fails to load
    

*   **Opening Modals**: Clicks the "View Question" button to open a modal.
*   **Retry Logic**: Retries loading the modal up to 3 times if it fails.

### Extracting Modal Data

    const modalDetails = await page.evaluate(() => {
      const assessment = document
        .querySelector(".question-banner .col-sm:nth-child(1) .column-content")
        ?.innerText.trim();
      const test = document
        .querySelector(".question-banner .col-sm:nth-child(2) .column-content")
        ?.innerText.trim();
      const domain = document
        .querySelector(".question-banner .col-sm:nth-child(3) .column-content")
        ?.innerText.trim();
      const skill = document
        .querySelector(".question-banner .col-sm:nth-child(4) .column-content")
        ?.innerText.trim();
      const difficulty =
        document
          .querySelector(
            ".question-banner .col-sm:nth-child(5) .column-content span"
          )
          ?.getAttribute("aria-label") || "N/A";
    
      return { assessment, test, domain, skill, difficulty };
    });
    

*   **Details Extracted**:
    *   Assessment
    *   Test
    *   Domain
    *   Skill
    *   Difficulty

* * *

5\. Saving Data
---------------

### Saving Incremental Data

    if (!fs.existsSync(data.folderName)) {
      fs.mkdirSync(data.folderName);
    }
    fs.writeFileSync(
      `${data.folderName}/${data.fileNamePrefix}_${increment}.json`,
      JSON.stringify(allData, null, 2)
    );
    

*   **Folders**: Ensures the folder for the filter exists.
*   **JSON Files**: Saves data incrementally with a unique filename.

* * *

6\. Final Steps
---------------

### Pagination Handling

    const nextButton = await page.$("#undefined_next");
    if (nextButton) {
      const isDisabled = await nextButton.evaluate((btn) =>
        btn.classList.contains("cb-disabled")
      );
      if (!isDisabled) {
        await nextButton.click();
        await page.waitForSelector("#apricot_table_9 tbody tr");
      } else {
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
    

*   **Next Button**: Checks if a "Next" button exists and is clickable.
*   **Pagination End**: Ends pagination if the button is disabled or missing.

### Completion

    await browser.close();
    console.log("Scraping completed. All data saved to result.json.");
    

*   **Browser**: Closes the Puppeteer browser.
*   **Log**: Outputs a completion message.
