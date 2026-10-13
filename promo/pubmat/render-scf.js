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
  await new Promise(r => server.listen(4612, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto('http://localhost:4612/announcement-editor.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const formats = [
    { p: 'x',  file: 'scf-x.png' },
    { p: 'fb', file: 'scf-fb.png' },
    { p: 'li', file: 'scf-li.png' },
  ];
  for (const f of formats) {
    await page.click(`#platform-seg button[data-p="${f.p}"]`);
    await page.waitForTimeout(150);
    const dataUrl = await page.evaluate(async () => {
      const stage = document.getElementById('stage');
      document.querySelectorAll('[contenteditable]').forEach(el => el.blur());
      return await htmlToImage.toPng(stage, { width: stage.offsetWidth, height: stage.offsetHeight, pixelRatio: 2, cacheBust: true });
    });
    fs.writeFileSync(path.join(__dirname, f.file), Buffer.from(dataUrl.split(',')[1], 'base64'));
    console.log(`${f.file}: ${fs.statSync(path.join(__dirname, f.file)).size} bytes`);
  }
  console.log('console errors:', errors.length ? errors : 'none');
  await browser.close();
  server.close();
})();
