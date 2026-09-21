const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 2, // 3200x1800 output, crisp for X
  });
  const htmlPath = 'file://' + path.resolve(__dirname, 'pubmat.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.resolve(__dirname, 'noir-pubmat.png'),
    clip: { x: 0, y: 0, width: 1600, height: 900 },
  });
  await browser.close();
  console.log('rendered noir-pubmat.png at 3200x1800');
})();
