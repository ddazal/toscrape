const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const url = 'http://quotes.toscrape.com/';
const file = path.join(__dirname, 'data/quotes.json');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(url);

  let json = [];
  let next = await page.$('.pager .next a');

  while (next) {
    next = await page.$('.pager .next a');
    const quotes = await page.$$eval('.quote', getData);
    json = json.concat(quotes);
    if (next) {
      await Promise.all([
        page.waitForNavigation(),
        page.click('.pager .next a'),
      ]);
    }
  }

  fs.writeFileSync(file, JSON.stringify(json), 'utf8');
  await browser.close();
})();

/**
 *
 * @param {Array} quotes
 * @return {Array}
 */
function getData(quotes) {
  return quotes.map((quote) => {
    return {
      quote: quote.querySelector('.text').textContent,
      author:
        quote.querySelector('.author')
          ? quote.querySelector('.author').textContent
          : '',
      tags:
        quote.querySelector('.tags')
          ? Array.from(quote.querySelectorAll('.tags .tag'))
              .map((tag) => tag.textContent)
          : [],
    };
  });
}
