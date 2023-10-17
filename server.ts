import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer-core';
import cors from "cors";

interface AmazonDeal {
  title: string;
  img: string;
  link: string;
}

const app = express();
const port = process.env['PORT'] || 3000;

app.use(cors());

app.get('/scrapeDeals', async (_: Request, res: Response) => {

  const SBR_WS_ENDPOINT = 'wss://brd-customer-hl_fe288543-zone-decoded_scraping_browser:pudqkypecju3@brd.superproxy.io:9222';
  const browser = await puppeteer.connect({
    browserWSEndpoint: SBR_WS_ENDPOINT
  });
  try {
    const page = await browser.newPage();
    await page.goto('https://www.amazon.de/-/en/deals');
    console.log("Connected! Navigated to https://www.amazon.de/deals...");

    const dealsGrid = await page.waitForSelector(".Grid-module__gridDisplayGrid_2X7cDTY7pjoTwwvSRQbt9Y");
    console.log("Deals appeared on the page...");

    if (!dealsGrid) {
      throw new Error('Deals Grid element was not found');
    }

    console.log("Start scraping data...");
    const parsedDeals = await dealsGrid.evaluate(dg => {
      const titleSelector = ".DealLink-module__dealLink_3v4tPYOP4qJj9bdiy0xAT";
      const linkSelector = '.a-link-normal.DealLink-module__dealLink_3v4tPYOP4qJj9bdiy0xAT';
      const imgSelector = '.DealImage-module__imageObjectFit_1G4pEkUEzo9WEnA3Wl0XFv';

      const dealElements = dg.querySelectorAll(".DealGridItem-module__dealItemDisplayGrid_e7RQVFWSOrwXBX4i24Tqg")
      const dealsData: AmazonDeal[] = [];

      dealElements.forEach(element => {
        const title = element.querySelector<HTMLElement>(titleSelector)?.innerText;
        if (title) {
          const link = element.querySelector<HTMLAnchorElement>(linkSelector)?.href;
          const img = element.querySelector<HTMLImageElement>(imgSelector)?.src;
          if (link && img) {
            dealsData.push({ title, link, img })
          }
        }
      });
      return dealsData;
    });
    console.log("Done! Amazon deals have been proccessed.");
    res.json({ products: parsedDeals });
  } catch (error) {
    console.error(error)
  }
  finally {
    await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});