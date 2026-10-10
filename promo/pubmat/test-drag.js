const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f === '/') f = '/announcement-editor.html';
  const p = path.join(__dirname, f);
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(p);
    const mime = { '.html':'text/html', '.js':'text/javascript', '.jpg':'image/jpeg', '.png':'image/png', '.css':'text/css' }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(4613, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto('http://localhost:4613/announcement-editor.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // enter move mode
  await page.click('#mode-seg button[data-mode="move"]');
  const moveMode = await page.evaluate(() => document.getElementById('stage').classList.contains('move-mode'));
  console.log('move-mode active =', moveMode);

  // transform before
  const before = await page.evaluate(() => document.querySelector('[data-drag="headline"]').style.transform || '(none)');

  // drag the headline
  const box = await page.locator('[data-drag="headline"]').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 60, { steps: 8 });
  await page.mouse.up();

  const after = await page.evaluate(() => document.querySelector('[data-drag="headline"]').style.transform || '(none)');
  console.log('headline transform before =', before);
  console.log('headline transform after  =', after);
  console.log('drag changed position =', before !== after);

  // switch ratio and confirm offset persists (non-empty transform)
  await page.click('#platform-seg button[data-p="x"]');
  await page.waitForTimeout(150);
  const afterRatio = await page.evaluate(() => document.querySelector('[data-drag="headline"]').style.transform || '(none)');
  console.log('transform after ratio switch =', afterRatio, '| persisted =', afterRatio !== '(none)');

  // export back on square and confirm offset is in the rendered PNG (element still transformed)
  await page.click('#platform-seg button[data-p="fb"]');
  await page.waitForTimeout(150);
  const dataUrl = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    return await htmlToImage.toPng(stage, { width: stage.offsetWidth, height: stage.offsetHeight, pixelRatio: 2, cacheBust: true });
  });
  const ok = dataUrl && dataUrl.startsWith('data:image/png;base64,');
  if (ok) {
    fs.writeFileSync(path.join(__dirname, 'test-drag-export.png'), Buffer.from(dataUrl.split(',')[1], 'base64'));
    console.log('export bytes =', fs.statSync(path.join(__dirname, 'test-drag-export.png')).size);
  }

  // reset layout clears transforms
  await page.click('#reset-layout');
  const afterReset = await page.evaluate(() => document.querySelector('[data-drag="headline"]').style.transform || '(none)');
  console.log('transform after reset =', afterReset);

  console.log('console errors:', errors.length ? errors : 'none');
  await browser.close();
  server.close();
})();
