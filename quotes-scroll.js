const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const url = 'http://quotes.toscrape.com/scroll';
const file = path.join(__dirname, 'data/quotes-scroll.json');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle0'});

  let json = [];
  let scroll = await page.evaluate(
      'window.pageYOffset + window.innerHeight <= document.body.scrollHeight');

  while (scroll) {
    const quotes = await page.$$eval('.quote', getData);
    json = quotes;
    await page.evaluate('window.scroll(0, document.body.scrollHeight)');
    await page.waitFor(500);
    scroll = await page.evaluate(
        'window.pageYOffset + window.innerHeight <= document.body.scrollHeight'
    );
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
