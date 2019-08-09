const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const url = 'http://books.toscrape.com/catalogue/page-1.html';
const file = path.join(__dirname, 'data/books.json');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  let json = []
  let next = await page.$('.pager .next a')
  while (next) {
    const data = await page.evaluate(getData);
    json = json.concat(data)
    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('.pager .next a'),
    ]);
    next = await page.$('.pager .next a')
  }
  fs.writeFileSync(file, JSON.stringify(json), 'utf8')
  await browser.close();
})();

function getData() {
  const products = Array.from(document.querySelectorAll('.product_pod'))
  const data = products.map(product => {
    return {
      title: product.querySelector('h3 a').getAttribute('title'),
      price: product.querySelector('.product_price .price_color').textContent,
      cover: location.origin + product.querySelector('img').getAttribute('src').slice(2, )
    }
  });
  return data;
}
