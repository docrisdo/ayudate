const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('fs');
const source=fs.readFileSync('.reference/voice-commands/verify.cjs','utf8');
const init=source.split('await p.addInitScript(()=>{')[1].split('});const click=')[0];
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true});
 const report=[];
 for(const mode of ['NotAllowedError','NotFoundError','unsupported','no-speech','network','audio-capture','prefixed','late-permission','start-error']){
  const page=await browser.newPage({viewport:{width:390,height:900}});page.setDefaultTimeout(7000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text())});
  await page.addInitScript({content:init});
  await page.addInitScript(mode=>{
   if(mode==='unsupported'){Object.defineProperty(window,'SpeechRecognition',{value:undefined})}
   if(mode==='prefixed'){Object.defineProperty(window,'webkitSpeechRecognition',{value:window.SpeechRecognition});Object.defineProperty(window,'SpeechRecognition',{value:undefined})}
   if(mode==='start-error')window.SpeechRecognition.prototype.start=function(){throw new Error('Unavailable')};
   if(mode.startsWith('Not'))window.permissionFailure=mode;
   if(mode==='late-permission')navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{window.grant=()=>{const track={readyState:'live',stop(){this.readyState='ended'}};tracks.push(track);resolve({getTracks:()=>[track]})}});
  },mode);
  await page.goto('http://localhost:5173/');
  const panel=page.getByRole('region',{name:'Comandos de voz'});
  await panel.getByRole('button',{name:'Iniciar guía por voz',exact:true}).click();
  if(mode==='late-permission'){
   await page.waitForFunction(()=>!!window.grant);await panel.getByRole('button',{name:'Detener escucha'}).click();await page.evaluate(()=>grant());await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>tracks.every(t=>t.readyState==='ended')&&!micActive&&engines.length===0));
  }else if(mode==='unsupported'){
   await panel.getByText(/no están disponibles/).waitFor();assert.equal(await page.evaluate(()=>permissionCalls),0);
  }else if(mode.startsWith('Not')||mode==='start-error'){
   await panel.getByText(/No pudimos acceder/).waitFor();
  }else{
   await page.waitForFunction(()=>micActive);assert.equal(await page.evaluate(()=>engines.at(-1).lang),'es-MX');
   if(mode==='prefixed'){await page.evaluate(()=>command('Inicio'));await page.getByRole('heading',{name:/Hola, ¿qué necesitas hoy/}).waitFor()}
   else {await page.evaluate(error=>{const engine=engines.at(-1);engine.onerror({error});engine.abort()},mode);await panel.getByText(mode==='network'?/Revisa tu conexión/:mode==='audio-capture'?/No pudimos acceder/:/No escuché/).waitFor()}
  }
  assert.equal(await page.evaluate(()=>micActive),false);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(mode==='unsupported'){
   await page.getByRole('button',{name:'Continuar sin configurar',exact:true}).click();
   await page.getByRole('heading',{name:/Hola, ¿qué necesitas hoy/}).waitFor();
   await page.getByRole('button',{name:'Leer',exact:true}).filter({visible:true}).first().click();
   assert.ok(await page.evaluate(()=>spoken.length>2));
  }
  assert.deepEqual(errors,[]);report.push({mode,passed:true});await page.close();
 }
 console.log(report);fs.writeFileSync('.reference/voice-commands/fallback-report.json',JSON.stringify(report,null,2));await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
