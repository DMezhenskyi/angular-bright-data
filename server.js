const express = require('express');
const puppeteer = require('puppeteer-core');
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/scrapeDeals', async (req, res) => {

  const SBR_WS_ENDPOINT = 'wss://brd-customer-hl_fe288543-zone-decoded_scraping_browser:pudqkypecju3@brd.superproxy.io:9222';
  const browser = await puppeteer.connect({
    browserWSEndpoint: SBR_WS_ENDPOINT
  });
  try {
    const page = await browser.newPage();
    
    console.log("Connected! Navigating to https://www.amazon.de/deals...");
    await page.goto('https://www.amazon.de/-/en/deals');

    const dealsGrid = await page.waitForSelector(".Grid-module__gridDisplayGrid_2X7cDTY7pjoTwwvSRQbt9Y");

    const products = await dealsGrid.evaluate(dg => {
      // data scraping...
      const titleSelector = ".DealLink-module__dealLink_3v4tPYOP4qJj9bdiy0xAT";
      const linkSelector = '.a-link-normal.DealLink-module__dealLink_3v4tPYOP4qJj9bdiy0xAT';
      const imgSelector = '.DealImage-module__imageObjectFit_1G4pEkUEzo9WEnA3Wl0XFv';

      const productElements = dg.querySelectorAll(".DealGridItem-module__dealItemDisplayGrid_e7RQVFWSOrwXBX4i24Tqg")
      const productData = [];

      productElements.forEach(element => {
        const title = element.querySelector(titleSelector)?.innerText;
        if(title) {
          const link = element.querySelector(linkSelector)?.href;
          const img = element.querySelector(imgSelector)?.src;
          productData.push({ title, link, img })
        }
      })
      return productData;
      

    })
    res.json({ products });
  } catch (error) {
    console.error(error)
  }
  finally {
    await browser.close();
  }
//
  
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});