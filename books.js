const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const url = 'http://books.toscrape.com/catalogue/page-1.html';
const file = path.join(__dirname, 'data/books.json');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const data = await page.evaluate(() => {
    const products = Array.from(document.querySelectorAll('.product_pod'))
    const data = products.map(product => {
      return {
        title: product.querySelector('h3 a').getAttribute('title'),
        price: product.querySelector('.product_price .price_color').textContent,
        cover: location.origin + product.querySelector('img').getAttribute('src').slice(2, )
      }
    });
    return data;
  });
  fs.writeFileSync(file, JSON.stringify(data), 'utf8')
  await browser.close();
})();
