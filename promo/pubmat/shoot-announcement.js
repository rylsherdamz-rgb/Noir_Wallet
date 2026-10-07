const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 2, // 2400x2400 output, crisp for social feeds
  });
  const htmlPath = 'file://' + path.resolve(__dirname, 'announcement.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.resolve(__dirname, 'noir-announcement.png'),
    clip: { x: 0, y: 0, width: 1200, height: 1200 },
  });
  await browser.close();
  console.log('rendered noir-announcement.png at 2400x2400');
})();
