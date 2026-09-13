const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const order = ['Boulder Series', 'Onyx Series', 'Crystal Series', 'Water Series', 'Doublet Series'];
const output = process.env.QA_OUTPUT;

(async () => {
  const browser = await puppeteer.launch({headless: true});
  try {
    const page = await browser.newPage();
    // Resolve site-root links locally; no contact submission or external script execution.
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.origin !== 'https://opalscreens.com') return request.abort();
      const file = path.resolve(root, '.' + decodeURIComponent(url.pathname), url.pathname.endsWith('/') ? 'index.html' : '');
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return request.abort();
      const types = {'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml'};
      request.respond({status:200, contentType:types[path.extname(file)] || 'application/octet-stream', body:fs.readFileSync(file)});
    });
    for (const route of ['/', '/solutions/home-theater/', '/solutions/commercial/', '/solutions/houses-of-worship/']) {
      await page.goto('https://opalscreens.com' + route, {waitUntil:'networkidle0'});
      const data = await page.evaluate(() => ({
        names: [...document.querySelectorAll('.series-name')].map(n => n.textContent.trim()),
        crystal: document.querySelector('.series-card.crystal').textContent,
        doublet: document.querySelector('.series-card.doublet')?.textContent,
        schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(n => JSON.parse(n.textContent)),
        content: document.body.innerText
      }));
      assert.deepEqual(data.names, order.filter(n => data.names.includes(n)), route);
      if (route === '/') assert.equal(data.names.length, 5);
      for (const term of ['SilkStream', '384', '1,000', '1080p120']) assert(data.crystal.includes(term), route + ': ' + term);
      assert(!data.crystal.includes('600 nits'));
      if (data.doublet) {
        for (const term of ['0.9 / 1.2 / 1.5mm', 'BlackFire', '60Hz']) assert(data.doublet.includes(term), route + ': Doublet ' + term);
        assert(!data.doublet.includes('SilkStream'));
      }
      const marks = await page.$$eval('.series-card', cards => cards.map(card => ({
        model: ['boulder','onyx','crystal','water','doublet'].find(name => card.classList.contains(name)),
        logos: [...card.querySelectorAll('.model-mark')].map(n => n.getAttribute('aria-label')),
        pitch: card.classList.contains('onyx') ? card.innerText : null
      })));
      const expected = {boulder:['BlackFire','SilkStream'], onyx:['BlackFire','NanoPix'], crystal:['BlackFire','SilkStream'], water:[], doublet:['BlackFire']};
      for (const card of marks) {
        assert.deepEqual(card.logos, expected[card.model], route + ': technology marks');
        if (card.pitch) assert(card.pitch.includes('0.7 / 0.6mm') && !card.pitch.includes('0.625'));
      }
      assert(!data.content.includes('2027'));
      for (const width of [1440, 390, 320]) {
        await page.setViewport({width, height:900});
        await page.$eval('.series-card.crystal', n => n.scrollIntoView({behavior:'instant', block:'center'}));
        await new Promise(resolve => setTimeout(resolve, 350));
        const bad = await page.$$eval('.series-specs li', rows => rows.filter(row => {
          const [label, value] = row.children;
          return label && value && label.getBoundingClientRect().right > value.getBoundingClientRect().left + 1;
        }).map(n => n.textContent));
        assert.deepEqual(bad, [], `${route} ${width}: spec text collision`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth
          ? [...document.querySelectorAll('body *')].filter(n => n.getBoundingClientRect().right > innerWidth + 1).map(n => n.className) : []);
        assert.deepEqual(overflow, [], `${route} ${width}: overflow`);
        assert(await page.$$eval('.model-mark', nodes => nodes.every(n => {
          const a=n.getBoundingClientRect(), b=n.closest('.series-card').getBoundingClientRect();
          return a.width > 0 && a.left >= b.left && a.right <= b.right;
        })), `${route} ${width}: wordmark fit`);
        if (output) await page.screenshot({path:path.join(output, `${route.replaceAll('/', '_')}-${width}.png`)});
      }
    }
    await page.goto('https://opalscreens.com/#silkstream');
    assert.deepEqual(await page.$$eval('.silk-step-hz', nodes => nodes.map(n => n.textContent)), ['60','120','384']);
    for (const hz of [120,384]) await page.waitForFunction(hz => document.querySelector('#silkHzNumber').textContent === String(hz), {timeout:15000}, hz);
    await page.goto('https://opalscreens.com/spec-sheets/doublet-series.html');
    assert.deepEqual(await page.$$eval('.pitch-value', nodes => nodes.map(n => n.textContent)), ['P0.9', 'P1.2', 'P1.5']);
    const sheet = await page.$eval('.specs-table', n => n.textContent);
    assert(sheet.includes('BlackFire') && sheet.includes('60Hz') && sheet.includes('Confirmation pending'));
    assert(!sheet.includes('70W') && !sheet.includes('239 BTU'));
    assert(await page.$eval('.page', n => n.contains(document.querySelector('.footer'))));
    assert(await page.$eval('.page', n => document.querySelector('.footer').getBoundingClientRect().bottom <= n.getBoundingClientRect().bottom));
    await page.goto('https://opalscreens.com/spec-sheets/onyx-series.html');
    assert.deepEqual(await page.$$eval('.pitch-value', nodes => nodes.map(n => n.textContent)), ['P0.7', 'P0.6']);
    const onyx = await page.$eval('.specs-table', n => n.innerText);
    assert(onyx.includes('0.7mm or 0.6mm') && onyx.includes('Confirmation pending per pitch'));
    assert(!onyx.includes('0.625') && !onyx.includes('0.78') && !onyx.includes('SilkStream'));
    for (const model of ['boulder','crystal','onyx','doublet']) {
      await page.goto(`https://opalscreens.com/spec-sheets/${model}-series.html`);
      assert(await page.$eval('.page', n => document.querySelector('.footer').getBoundingClientRect().bottom <= n.getBoundingClientRect().bottom), model + ': sheet overflow');
      assert.equal(await page.$eval('.model-mark', n => getComputedStyle(n).fontSize), '17px');
    }
    console.log('PASS: lineup/order, Onyx/Doublet pitches, technology logos and eligibility, PDF-source fit, structured data, 320/390/1440 layout, original animation.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
