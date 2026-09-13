const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const puppeteer = require('../spec-sheets/node_modules/puppeteer');
const root = path.resolve(__dirname, '..');
const baseline = execFileSync('git', ['show', 'cb88a4e:index.html'], {cwd:root, encoding:'utf8'});
const output = process.env.OPAL_QA_OUTPUT;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({headless:true});
  try {
    const page = await browser.newPage();
    const errors = [], missing = [], posts = [];
    let responseMode = 'error';
    page.on('pageerror', e => errors.push(e.message));
    await page.setRequestInterception(true);
    // Exercise the production page without sending leads or solving a real CAPTCHA.
    page.on('request', async request => {
      const url = new URL(request.url());
      if (url.hostname === 'challenges.cloudflare.com') {
        return request.respond({status:200,contentType:'application/javascript',body:'window.turnstile={reset(){}};'});
      }
      if (request.method() === 'POST') {
        posts.push({url:request.url(),body:JSON.parse(request.postData())});
        return request.respond({status:responseMode==='error'?429:200,contentType:'application/json',
          headers:{'Access-Control-Allow-Origin':'*'},
          body:JSON.stringify(responseMode==='error'?{error:'Please try again later'}:{success:true})});
      }
      if (request.method() === 'OPTIONS') {
        return request.respond({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST'}});
      }
      if (url.origin === 'https://opal-preview.test') {
        let file = path.join(root,decodeURIComponent(url.pathname));
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
        if (!fs.existsSync(file)) {missing.push(url.pathname);return request.respond({status:404,body:'Not found'});}
        const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf'};
        return request.respond({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
      }
      return request.continue();
    });
    await page.setViewport({width:1440,height:900});
    await page.goto('https://opal-preview.test/',{waitUntil:'networkidle0'});
    const parity=await page.evaluate(source=>{
      const old=new DOMParser().parseFromString(source,'text/html');
      const clean=s=>s.split('\n').map(l=>l.trimEnd()).join('\n').trim();
      return {
        titleSame:old.title===document.title,
        scriptsPreserved:[...old.querySelectorAll('body script:not([src])')].every(s=>[...document.querySelectorAll('body script:not([src])')].some(n=>clean(n.textContent)===clean(s.textContent))),
        formSame:old.querySelector('form').outerHTML.replace(/data-loaded-at="[^"]*"/,'data-loaded-at=""')===document.querySelector('form').outerHTML.replace(/data-loaded-at="[^"]*"/,'data-loaded-at=""'),
        idsPreserved:[...old.querySelectorAll('[id]')].every(n=>document.getElementById(n.id)),
        linksPreserved:[...old.querySelectorAll('a[href]')].every(n=>[...document.querySelectorAll('a[href]')].some(a=>new URL(a.getAttribute('href'),'https://opalscreens.com/').href===new URL(n.getAttribute('href'),'https://opalscreens.com/').href)),
        h1:document.querySelector('h1').innerText.replace(/\s+/g,' ').trim(),
        canonical:document.querySelector('link[rel=canonical]').href,
        schema:[...document.querySelectorAll('script[type="application/ld+json"]')].map(n=>JSON.parse(n.textContent)),
        answers:[...document.querySelectorAll('.faq-answer p')].map(n=>n.textContent),
        models:[...document.querySelectorAll('.series-card')].map(n=>({id:n.id,desc:n.querySelector('.series-desc').textContent,marks:[...n.querySelectorAll('.model-mark')].map(m=>m.getAttribute('aria-label'))})),
        urls:[...document.querySelectorAll('a[href]')].map(n=>n.getAttribute('href')),
        noindex:!!document.querySelector('meta[name=robots][content*=noindex]'),
        previewScript:!!document.querySelector('script[src*=preview]'),
        turnstile:!!document.querySelector('script[src*="turnstile/v0/api.js"]'),
        text:document.body.innerText
      };
    },baseline);
    for(const key of ['titleSame','scriptsPreserved','formSame','idsPreserved','linksPreserved','turnstile'])assert(parity[key],key);
    assert.equal(await page.$$eval('h1',n=>n.length),1);
    assert.equal(parity.h1,'Premium MicroLED Video Walls');
    assert.equal(parity.canonical,'https://opalscreens.com/');
    assert(!parity.noindex&&!parity.previewScript);
    assert(!/2027|zero glare|heralds a new era|epitome of precision/i.test(parity.text));
    assert.deepEqual(parity.models.map(n=>n.id),['boulder','onyx','crystal','water','doublet']);
    const marks={boulder:['BlackFire','SilkStream'],onyx:['BlackFire','NanoPix'],crystal:['BlackFire','SilkStream'],water:[],doublet:['BlackFire']};
    for(const model of parity.models)assert.deepEqual(model.marks,marks[model.id]);
    const products=parity.schema.find(Array.isArray);
    for(const model of parity.models) {
      const product=products.find(p=>p.name.toLowerCase().includes(model.id));
      assert.equal(product.description,model.desc);assert(!product.offers);
    }
    assert(parity.schema.some(s=>s['@type']==='Brand'));
    assert(!JSON.stringify(parity.schema).includes('SearchAction'));
    assert.deepEqual(parity.schema.find(s=>s['@type']==='FAQPage').mainEntity.map(q=>q.acceptedAnswer.text),parity.answers);
    for(const href of parity.urls) {
      const u=new URL(href,'https://opalscreens.com/');
      if(u.origin==='https://opalscreens.com')assert(fs.existsSync(path.join(root,u.pathname)),'Missing destination '+href);
    }
    if(output)fs.mkdirSync(output,{recursive:true});
    for(const [width,height] of [[1920,1080],[1440,900],[768,1024],[390,844],[320,568]]) {
      await page.setViewport({width,height});
      for(const selector of ['.hero','#series','#silkstream','#contact']) {
        await page.$eval(selector,n=>{document.documentElement.style.scrollBehavior='auto';n.scrollIntoView({block:'start'});});
        await sleep(200);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+width+' '+selector);
        if(output)await page.screenshot({path:path.join(output,width+'-'+selector.slice(1)+'.png')});
      }
      await page.$eval('#boulder details',n=>n.open=true);
      assert(await page.$eval('#boulder .series-specs',n=>n.getBoundingClientRect().height>0));
      await page.$eval('#boulder details',n=>n.open=false);
    }
    await page.click('#mobileToggle');
    assert.equal(await page.$eval('#mobileToggle',n=>n.getAttribute('aria-expanded')),'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('#mobileToggle',n=>n.getAttribute('aria-expanded')),'false');
    await page.$eval('.faq-question',n=>n.click());
    assert.equal(await page.$eval('.faq-question',n=>n.getAttribute('aria-expanded')),'true');
    await page.$eval('#silkDemo',n=>n.scrollIntoView({block:'center'}));
    const phases=new Set();
    for(let i=0;i<13;i++){phases.add(await page.$eval('#silkHzNumber',n=>n.textContent));await sleep(1000);}
    for(const hz of ['60','120','384'])assert(phases.has(hz),'Demo '+hz);
    assert(await page.$$eval('img',n=>n.every(i=>i.complete&&i.naturalWidth)));
    await page.$eval('form',n=>n.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
    assert.equal(posts.length,0);
    assert.equal(await page.$eval('form button[type=submit]',n=>n.textContent),'Please complete verification');
    await page.evaluate(()=>{
      const field=document.createElement('input');field.name='cf-turnstile-response';field.value='test-only-token';
      document.querySelector('.cf-turnstile').append(field);
      document.querySelector('#name').value='QA local only';
      document.querySelector('#email').value='test@example.invalid';
      document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    });
    await page.waitForFunction(()=>document.querySelector('form button').textContent==='Please try again later');
    assert.equal(posts.length,1);assert.equal(posts[0].url,'https://atools-api.gamma.tech/functions/opalContact');
    assert.equal(posts[0].body['cf-turnstile-response'],'test-only-token');assert('_honey' in posts[0].body);assert(posts[0].body._elapsed>0);
    assert.equal(await page.$eval('form button',n=>n.disabled),false);
    responseMode='success';
    await Promise.all([page.waitForNavigation({waitUntil:'networkidle0'}),page.$eval('form',n=>n.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})))]);
    assert.equal(new URL(page.url()).pathname,'/thanks.html');
    assert.deepEqual(errors,[]);
    // The unchanged site has no default favicon; validate every referenced asset.
    assert.deepEqual(missing.filter(url=>url!=='/favicon.ico'),[]);
    console.log(JSON.stringify({pass:true,viewports:[1920,1440,768,390,320],parity:'URLs, model facts, original scripts and form preserved',SEO:'indexable canonical; matching FAQ and Product data; no fake offers',form:'missing token blocked; mocked rate-limit/error and success verified; zero real leads sent',phases:[...phases],errors,missing}));
  } finally {await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
