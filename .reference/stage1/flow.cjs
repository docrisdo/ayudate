const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function seed(p,mode='ok',empty=false){
 await p.addInitScript(({mode,empty})=>{
  if(!localStorage.getItem('stage1seed')){
   localStorage.setItem('stage1seed','1');
   localStorage.setItem('ayudate-preferences',JSON.stringify({voice:true,autoRead:true,voiceCommands:true,accompaniment:true,largeText:false,highContrast:false,pictograms:false,bigButtons:true,accessibleRoute:true,vibrations:true}));
   localStorage.setItem('ayudate-support-selection',JSON.stringify(['visual','motor']));
   localStorage.setItem('ayudate-lists',JSON.stringify(empty?[]:[{id:'test',name:'Compra de prueba',items:[1,5],quantities:{1:2,5:1}}]));
   localStorage.setItem('ayudate-active-list',JSON.stringify(empty?null:'test'));
   localStorage.setItem('ayudate-cart',JSON.stringify({1:1,5:1}));
  }
  window.spoken=[];window.mic=0;window.permissions=0;window.speechEvents=[];
  window.SpeechRecognition=class{start(){window.mic++}};
  if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{window.permissions++;throw Error('must not request')};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:mode==='unsupported'?undefined:{
   speak(u){window.spoken.push(u.text);window.currentUtterance=u;if(mode==='fail')setTimeout(()=>u.onerror?.({error:'synthesis-failed'}),20);else u.onstart?.()},
   cancel(){window.speechEvents.push('cancel')},pause(){window.speechEvents.push('pause')},resume(){window.speechEvents.push('resume')}
  }});
  if(mode==='unsupported')delete window.speechSynthesis;
 },{mode,empty});
 await p.goto('http://localhost:5173');await p.getByRole('button',{name:'Comenzar',exact:true}).waitFor();
}
const summary='Tu lista Compra de prueba tiene 2 productos. Te queda 1 por recoger.';
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',headless:true});try{
 for(const width of [1440,768,390]){
  const p=await b.newPage({viewport:{width,height:900},hasTouch:width<500});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  const press=async locator=>width<500?locator.tap():locator.click();
  const noOverflow=async()=>assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await seed(p);await p.waitForTimeout(150);
  assert.deepEqual(await p.evaluate(()=>spoken),[]);assert.equal(await p.locator('.voice-commands').count(),0);assert.equal(await p.getByRole('checkbox').count(),0);
  await noOverflow();await p.screenshot({path:`.reference/stage1/welcome-${width}.png`,fullPage:true});
  await press(p.getByRole('button',{name:'Comenzar',exact:true}));await p.waitForTimeout(150);
  assert.deepEqual(await p.evaluate(()=>spoken),[]);assert.equal(await p.locator('.home-context-summary').textContent(),summary);
  assert.equal(await p.locator('.a11y-sr-only[role=status]').textContent(),summary);
  await press(p.getByRole('button',{name:'Configurar accesibilidad',exact:true}));
  assert.equal(await p.getByRole('switch').count(),3);
  await p.getByRole('switch',{name:'Texto más grande',exact:true}).check();
  await press(p.getByRole('button',{name:'Cancelar',exact:true}));
  assert.equal(await p.locator('.app-shell.large-text').count(),0);
  await p.reload();await press(p.getByRole('button',{name:'Personalizar experiencia',exact:true}));
  const toggle=p.getByRole('switch',{name:'Acompañamiento por voz',exact:true});
  await toggle.focus();await p.keyboard.press('Space');assert.ok(await toggle.isChecked());
  const initialFont=await p.locator('.ac-setting-copy strong').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
  await p.getByRole('switch',{name:'Texto más grande',exact:true}).check();
  const largeFont=await p.locator('.ac-setting-copy strong').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));assert.ok(largeFont>initialFont);
  await p.getByRole('switch',{name:'Alto contraste',exact:true}).check();
  assert.equal(await p.locator('.app-shell.high-contrast').count(),1);
  assert.deepEqual(await p.evaluate(()=>spoken),[]);
  assert.equal(await p.getByRole('button',{name:/Agregar.*carrito/}).count(),0);
  const cart=await p.evaluate(()=>localStorage.getItem('ayudate-cart'));
  await noOverflow();await p.screenshot({path:`.reference/stage1/personalize-${width}.png`,fullPage:true});
  await press(p.getByRole('button',{name:'Guardar y continuar',exact:true}));await p.waitForTimeout(150);
  assert.deepEqual(await p.evaluate(()=>spoken),[summary]);
  assert.equal(await p.evaluate(()=>document.activeElement.tagName),'H1');
  assert.equal(await p.locator('.a11y-sr-only[role=status]').textContent(),'');
  assert.equal(await p.evaluate(()=>localStorage.getItem('ayudate-cart')),cart);
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('ayudate-preferences'))),{largeText:true,highContrast:true});
  assert.equal(await p.evaluate(()=>localStorage.getItem('ayudate-support-selection')),null);
  const controls=p.getByRole('region',{name:'Controles de lectura'});
  await press(controls.getByRole('button',{name:'Pausar',exact:true}));
  await press(controls.getByRole('button',{name:'Reanudar',exact:true}));
  assert.ok(await p.evaluate(()=>speechEvents.includes('pause')));
  await press(controls.getByRole('button',{name:'Detener',exact:true}));await p.waitForTimeout(100);
  assert.equal(await p.locator('.a11y-sr-only[role=status]').textContent(),'','Stopping is not a synthesis failure');
  await noOverflow();await p.screenshot({path:`.reference/stage1/home-${width}.png`,fullPage:true});
  await press(p.getByRole('button',{name:'Desactivar acompañamiento',exact:true}));
  assert.match(await p.locator('.home-voice-toggle').textContent(),/apagado/);
  await p.reload();await p.waitForTimeout(100);
  assert.deepEqual(await p.evaluate(()=>spoken),[]);assert.equal(await p.locator('.app-shell.high-contrast.large-text').count(),1);
  await press(p.getByRole('button',{name:'Personalizar experiencia',exact:true}));assert.equal(await toggle.isChecked(),false);
  assert.deepEqual(await p.evaluate(()=>[mic,permissions]),[0,0]);assert.deepEqual(errors,[]);
  console.log({width,flow:true,cancel:true,persistVisuals:true,silentReload:true,mic:0,errors});await p.close();
 }
 for(const mode of ['fail','unsupported']){
  const p=await b.newPage();await seed(p,mode,true);
  await p.getByRole('button',{name:'Personalizar experiencia',exact:true}).click();
  await p.getByRole('switch',{name:'Acompañamiento por voz',exact:true}).check();
  await p.getByRole('button',{name:'Guardar y continuar',exact:true}).click();await p.waitForTimeout(200);
  const expected='No tienes una lista activa. Selecciona una para comenzar tu compra.';
  assert.equal(await p.locator('.home-context-summary').textContent(),expected);
  assert.equal(await p.locator('.a11y-sr-only[role=status]').textContent(),expected);
  assert.equal(await p.locator('.voice-commands').count(),0);
  console.log({mode,accessibleFallback:true,emptyList:true});await p.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
