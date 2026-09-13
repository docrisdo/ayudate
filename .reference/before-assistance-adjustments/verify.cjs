const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1536,height:1000}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://localhost:5173/');
 await page.getByRole('button',{name:'Solicitar asistencia',exact:true}).first().click();
 async function measure(){return page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,logo:[...document.querySelectorAll('header img[alt="AYÚDATE"]')].map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,loaded:e.naturalWidth})).filter(x=>x.width>0),badText:/prototipo/i.test(document.body.innerText)}))}
 const desktop=await measure(); assert.ok(desktop.logo.some(x=>x.width===142)); assert.equal(desktop.badText,false);
 await page.screenshot({path:'.reference/before-assistance-adjustments/desktop-final.png',fullPage:true});
 const options=page.getByRole('group',{name:'Opciones de asistencia'}).locator('button.as-option');
 for(let i=0;i<5;i++){
  await options.nth(i).click();
  await page.getByRole('button',{name:'Notificar al personal',exact:true}).click();
  assert.match(await page.locator('.as-notify').innerText(),/Solicitud enviada/);
  await page.getByRole('button',{name:'Mostrar mensaje en pantalla',exact:true}).click();
  assert.match(await page.getByRole('dialog').innerText(),/Solicitud enviada/);
  assert.doesNotMatch(await page.getByRole('dialog').innerText(),/prototipo/i);
  await page.getByRole('button',{name:'Volver a las opciones',exact:true}).click();
 }
 await options.first().click();
 await page.getByRole('button',{name:'Mostrar mensaje en pantalla',exact:true}).click();
 await page.getByRole('button',{name:'Confirmar solicitud',exact:true}).click();
 await page.getByRole('button',{name:'Leer mensaje',exact:true}).click();
 await page.getByRole('button',{name:'Volver a las opciones',exact:true}).click();
 assert.match(await page.locator('.as-notify').innerText(),/Solicitud enviada/);
 await page.getByRole('button',{name:'Accesibilidad',exact:true}).first().click();
 await page.getByRole('checkbox',{name:/^Texto más grande/}).check();
 await page.getByRole('checkbox',{name:/^Botones simplificados/}).check();
 await page.getByRole('button',{name:'Solicitar asistencia',exact:true}).first().click();
 const big=await measure(); assert.ok(big.logo.some(x=>x.width===142)); assert.ok(big.scroll<=big.width);
 await page.screenshot({path:'.reference/before-assistance-adjustments/desktop-accessible.png',fullPage:true});
 const mobile=[];
 for(const width of [390,430]){
  await page.setViewportSize({width,height:844});
  await options.nth(2).click();
  await page.getByRole('button',{name:'Notificar al personal',exact:true}).click();
  const result=await measure(); assert.ok(result.scroll<=width);assert.equal(result.badText,false); assert.ok(result.logo.some(x=>x.width===72));
  mobile.push(result);
  await page.screenshot({path:`.reference/before-assistance-adjustments/mobile-${width}.png`,fullPage:true});
 }
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({desktop,big,mobile,optionsTested:5,modalConfirmation:true,errors},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
