const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

// tiny static server so Google Fonts + html-to-image load correctly
const server = http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f === '/') f = '/announcement-editor.html';
  const p = path.join(__dirname, f);
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(p);
    const mime = { '.html':'text/html', '.js':'text/javascript', '.jpg':'image/jpeg', '.png':'image/png' }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(4611, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto('http://localhost:4611/announcement-editor.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // edit text fields
  await page.fill('#i-h2', 'Stellar Kickstart');
  await page.fill('#i-badge', "We're In");
  await page.fill('#i-program', 'Build Cohort · Wave 2');
  const h2 = await page.textContent('#p-h2');
  console.log('headline line2 =', JSON.stringify(h2));

  // render each platform format
  const formats = [
    { p: 'x',  w: 1600, h: 900,  file: 'preview-x.png' },
    { p: 'fb', w: 1200, h: 1200, file: 'preview-fb.png' },
    { p: 'li', w: 1200, h: 627,  file: 'preview-li.png' },
  ];
  for (const f of formats) {
    await page.click(`#platform-seg button[data-p="${f.p}"]`);
    await page.waitForTimeout(150);
    const dataUrl = await page.evaluate(async () => {
      const stage = document.getElementById('stage');
      document.querySelectorAll('[contenteditable]').forEach(el => el.blur());
      return await htmlToImage.toPng(stage, { width: stage.offsetWidth, height: stage.offsetHeight, pixelRatio: 2, cacheBust: true });
    });
    if (dataUrl && dataUrl.startsWith('data:image/png;base64,')) {
      fs.writeFileSync(path.join(__dirname, f.file), Buffer.from(dataUrl.split(',')[1], 'base64'));
      console.log(`${f.file}: ${fs.statSync(path.join(__dirname, f.file)).size} bytes`);
    } else {
      console.log(`WARNING: ${f.file} export failed`);
    }
  }

  console.log('console errors:', errors.length ? errors : 'none');
  await browser.close();
  server.close();
})();
