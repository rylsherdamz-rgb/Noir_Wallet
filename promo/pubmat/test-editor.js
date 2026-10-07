const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

const DIR = __dirname;
const MIME = { '.html':'text/html', '.js':'text/javascript', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml' };

// tiny static server so the CDN script + logo load like a real site
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/editor.html';
  const fp = path.join(DIR, p);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(4599, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  await page.goto('http://localhost:4599/editor.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. edit the headline line 1
  await page.fill('#i-head1', 'Just tap.');
  // 2. edit gold wordmark
  await page.fill('#i-word2', 'PAY');
  // 3. add a chip
  await page.click('#add-chip');
  // 4. change accent color via swatch (green)
  await page.click('.swatch[data-col="#3ED598"]');
  await page.waitForTimeout(300);

  // verify live preview reflected the changes
  const head1 = await page.textContent('#p-head1');
  const word2 = await page.textContent('#p-word2');
  const chipCount = await page.$$eval('#p-chips .chip', els => els.length);
  const accent = await page.evaluate(() => getComputedStyle(document.getElementById('stage')).getPropertyValue('--accent').trim());

  console.log('LIVE head1:', JSON.stringify(head1));
  console.log('LIVE word2:', JSON.stringify(word2));
  console.log('LIVE chipCount:', chipCount);
  console.log('LIVE accent:', accent);

  // 5. switch to 1:1
  await page.click('#ratio-seg button:nth-child(2)');
  await page.waitForTimeout(300);
  const sq = await page.evaluate(() => {
    const s = document.getElementById('stage');
    return { w: s.style.width, h: s.style.height };
  });
  console.log('SQUARE dims:', JSON.stringify(sq));

  // back to 16:9 for the export test
  await page.click('#ratio-seg button:nth-child(1)');
  await page.waitForTimeout(300);

  // 6. trigger export and capture the download
  const [ download ] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    page.click('#export'),
  ]);
  const outPath = path.join(DIR, 'editor-export-test.png');
  await download.saveAs(outPath);
  const size = fs.statSync(outPath).size;
  console.log('EXPORT filename:', download.suggestedFilename());
  console.log('EXPORT saved bytes:', size);

  // screenshot the whole editor UI for visual review
  await page.screenshot({ path: path.join(DIR, 'editor-ui.png') });

  console.log('CONSOLE ERRORS:', errors.length ? errors : 'none');

  await browser.close();
  server.close();
})();
