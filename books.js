const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const url = 'http://books.toscrape.com/';
const file = path.join(__dirname, 'data/books.json');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(url);

  const json = [];
  let next = await page.$('.pager .next a');
  while (next) {
    let articles = await page.$$('.product_pod h3 a');
    for (let index = 0; index < articles.length; index++) {
      await Promise.all([
        page.waitForNavigation(),
        articles[index].click(),
      ]);
      const data = await page.evaluate(getData);
      json.push(data);
      await page.goBack();
      articles = await page.$$('.product_pod h3 a');
    }
    await Promise.all([
      page.waitForNavigation(),
      page.click('.pager .next a'),
    ]);
    next = await page.$('.pager .next a');
  }
  fs.writeFileSync(file, JSON.stringify(json), 'utf8');
  await browser.close();
})();

/**
 * @return {object}
 */
function getData() {
  const product = document.querySelector('.product_page');
  return {
    title: product.querySelector('h1').textContent,
    price: product.querySelector('.price_color').textContent,
    description:
      document.querySelector('#product_description ~ p')
        ? document.querySelector('#product_description ~ p').textContent
        : '',
    category:
      document.querySelector('.breadcrumb li:nth-child(3) a')
        ? document.querySelector('.breadcrumb li:nth-child(3) a').textContent
        : '',
    cover:
      location.origin +
      document.querySelector('#product_gallery img')
          .getAttribute('src').slice(5),
  };
}
