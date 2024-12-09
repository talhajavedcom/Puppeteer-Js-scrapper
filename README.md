# Puppeteer Scraper Documentation

## Overview
This script uses Puppeteer to scrape question data from the SAT Suite Question Bank website. It applies filters, navigates through paginated results, and extracts detailed information for each question into a JSON file.

## Prerequisites
- Node.js installed on your system.
- Puppeteer library installed (`npm install puppeteer`).

## Script Workflow
The script follows these steps:
1. Launches a browser instance and opens a new page.
2. Navigates to the SAT Suite Question Bank search page.
3. Applies filters for assessment type, test type, and topic (e.g., Algebra).
4. Clicks the search button and waits for the results page to load.
5. Iterates through the paginated results table, extracting question details from each row.
6. For each question, opens a modal to scrape additional details and the full question content.
7. Saves all scraped data incrementally to a `result.json` file.

## Code Breakdown

### 1. Importing Required Libraries
```javascript
const puppeteer = require("puppeteer");
const fs = require("fs");
```
Imports Puppeteer for browser automation and the filesystem module for saving data.

### 2. Browser Initialization
```javascript
const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();
```
Launches a browser instance in non-headless mode and opens a new tab.

### 3. Navigating to the Target Website
```javascript
await page.goto(
  "https://satsuitequestionbank.collegeboard.org/digital/search",
  { waitUntil: "networkidle2" }
);
```
Opens the SAT Suite Question Bank search page and waits for the network to be idle.

### 4. Applying Filters
```javascript
await page.select("#selectAssessmentType", "99");
await page.select("#selectTestType", "2");
await page.click("#checkbox-algebra");
```
Sets the filters for SAT assessment, Math test type, and Algebra topic.

### 5. Scraping Data
Loops through rows in the results table, scraping data for each question:
```javascript
const tableRows = await page.$$("#apricot_table_9 tbody tr");
for (let row of tableRows) {
  const rowData = await row.evaluate((row) => {
    const columns = Array.from(row.querySelectorAll("td"));
    return {
      id: columns[1]?.innerText.trim(),
      skill: columns[3]?.innerText.trim(),
      skillDescription: columns[4]?.innerText.trim(),
    };
  });
}
```

### 6. Opening and Scraping Modal Details
For each row, opens a modal and extracts detailed information:
```javascript
const button = await row.$(".view-question-button");
await button.click();
await page.waitForSelector(".cb-dialog-content .column-content");
```
Scrapes the modal title, assessment details, and the full question content.

### 7. Saving Data
Saves the scraped data incrementally to a JSON file:
```javascript
fs.writeFileSync("result.json", JSON.stringify(allData, null, 2));
```

### 8. Pagination Handling
Checks if there is a next page and navigates to it:
```javascript
const nextButton = await page.$("#undefined_next");
if (nextButton) {
  const isDisabled = await nextButton.evaluate((btn) =>
    btn.classList.contains("cb-disabled")
  );
  if (!isDisabled) {
    await nextButton.click();
    await page.waitForSelector("#apricot_table_9 tbody tr");
  }
}
```

## Output
The script generates a `result.json` file containing an array of objects. Each object includes:
- Question ID
- Skill and skill description
- Modal details (title, assessment, test, domain, skill, difficulty)
- Full question content as HTML

## Error Handling
The script includes retry logic for loading modals and skips rows where scraping fails. Errors are logged to the console for debugging.

## Conclusion
This script automates the extraction of question data from the SAT Suite Question Bank website, handling filters, pagination, and detailed modal content. It is robust and capable of incremental data saving for reliability.
