const {chromium,firefox,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.SITE_URL||'http://127.0.0.1:8080/';
(async()=>{
 for(const [name,type] of Object.entries({chromium,firefox,webkit})){
  const browser=await type.launch(name==='chromium'?{args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{});try{
   for(const mobile of name==='chromium'?[false,true]:[false]){
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,serviceWorkers:'allow'});const page=await context.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(base).origin)external.push(r.url())});
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});await page.locator('#metrics .metric').first().waitFor();await page.locator('button[data-speed="0"]').click();
    assert.equal(await page.locator('#metrics .metric').count(),5);await page.locator('#next').click();
    await page.locator('#reset').click();await page.locator('input[value="metro"]').check();await page.locator('#launchWorld').click();assert.equal(await page.evaluate(()=>window.agentCity.game.n),19);
    await page.locator('#transit').fill('10');assert.equal(await page.evaluate(()=>window.agentCity.game.state.transit),10);
    await page.locator('#residentSearch').fill('Working');await page.locator('#residentSearch').fill('');await page.locator('#people .agentrow').first().click();await page.locator('#detail [data-chat]').click();await page.locator('[data-question="needs"]').click();assert.ok((await page.locator('#residentReply').textContent()).length>10);await page.locator('#residentDialog button[value="close"]').click();
    await page.locator('#save').click();await page.reload({waitUntil:'domcontentloaded'});await page.locator('#metrics .metric').first().waitFor();assert.equal(await page.evaluate(()=>window.agentCity.game.n),19);
    await page.waitForFunction(()=>window.city3DActive&&window.cityRenderedFrames>2||document.querySelector('#renderStatus').textContent.includes('2D MODE'),null,{timeout:60000});const active=await page.evaluate(()=>!!window.city3DActive);
    if(name==='chromium'){assert.ok(active,'Chromium software WebGL must render');assert.equal(await page.evaluate(()=>window.cityRendererVersion),'170');await page.locator('#quality').selectOption('low');await page.locator('#streetView').click();assert.equal(await page.locator('#walkPad').isVisible(),true);await page.locator('#streetView').click();await page.locator('#viewToggle').click();assert.equal(await page.evaluate(()=>window.city3DActive),false)}
    if(name==='chromium'&&!mobile){await page.waitForFunction(()=>window.cityOfflineReady===true,null,{timeout:60000});await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await page.locator('#metrics .metric').first().waitFor();assert.equal(await page.evaluate(()=>window.agentCity.game.n),19);await context.setOffline(false)}
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log(name,mobile?'mobile viewport':'desktop',active?'3D':'2D fallback','PASS');await context.close();
   }
  }finally{await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
