const { chromium } = require('playwright');
const assert = require('node:assert/strict');
async function setup(page, mode = 'supported') {
  await page.addInitScript(({ mode }) => {
    localStorage.setItem('ayudate-preferences', JSON.stringify({ voice: true, autoRead: true, voiceCommands: true, highContrast: true }));
    window.events = []; window.spoken = []; window.starts = 0;
    Object.defineProperty(window, 'speechSynthesis', { value: {
      speak(u) { window.spoken.push(u.text); window.utterance = u; u.onstart?.(); },
      cancel() { window.events.push('cancel'); }, resume() { window.events.push('resume'); }, pause() { window.events.push('pause'); }
    }});
    class Recognition {
      start() { window.starts++; window.events.push('start'); window.engine = this;
        if (mode === 'denied') { setTimeout(() => { this.onerror?.({ error: 'not-allowed' }); this.onend?.(); }, 10); }
        else setTimeout(() => this.onstart?.(), 0);
      }
      abort() { window.events.push('abort'); setTimeout(() => this.onend?.(), 0); }
    }
    Object.defineProperty(window, 'SpeechRecognition', { value: mode === 'unsupported' ? undefined : Recognition, configurable: true });
    Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined, configurable: true });
    window.deliver = text => { const item = [{ transcript: text }]; item.isFinal = true; window.engine.onresult({ results: [item] }); };
  }, { mode });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(150);
}
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
  try {
    for (const width of [1440, 390, 430]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 500 });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await setup(page);
      const press = async locator => width < 500 ? locator.tap() : locator.click();
      const commandButton = page.getByRole('button', { name: 'Dar un comando por voz', exact: true });
      const status = page.getByRole('region', { name: 'Comandos de voz' }).getByRole('status');
      const command = async text => { await press(commandButton); await page.waitForFunction(() => document.querySelector('.voice-commands [role=status]')?.textContent.includes('Escuchando…')); await page.evaluate(text => window.deliver(text), text); await page.waitForTimeout(120); };
      await press(page.getByRole('heading', { name: 'Configura tu experiencia', exact: true }));
      assert.equal(await page.evaluate(() => window.starts), 0);
      assert.deepEqual(await page.evaluate(() => window.spoken), []);
      await press(page.getByRole('button', { name: 'Ver comandos de voz', exact: true }));
      assert.equal(await page.evaluate(() => document.activeElement.id), 'voice-help-title');
      for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); assert.ok(await page.evaluate(() => !!document.activeElement.closest('dialog[open]'))); }
      assert.equal(await page.getByRole('dialog').getByRole('heading', { name: 'Buscar', exact: true }).count(), 0);
      if (width === 1440) await page.keyboard.press('Escape');
      else await press(page.getByRole('button', { name: 'Cerrar ayuda de voz' }));
      await page.waitForFunction(() => document.activeElement.textContent === 'Ver comandos de voz');
      await press(page.getByRole('button', { name: 'Continuar', exact: true }));
      assert.equal(await page.getByRole('checkbox', { name: 'Lectura en voz alta', exact: true }).isChecked(), false);
      assert.equal(await page.getByRole('checkbox', { name: 'Comandos de voz', exact: true }).isChecked(), false);
      assert.equal(await page.getByRole('checkbox', { name: 'Alto contraste', exact: true }).isChecked(), true);
      await page.getByRole('checkbox', { name: 'Comandos de voz', exact: true }).check();
      assert.equal(await page.evaluate(() => window.starts), 0);
      await command('Inicio');
      assert.match(await page.title(), /Inicio/);
      assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1');
      assert.equal(await page.evaluate(() => window.engine.continuous), false);
      assert.deepEqual(await page.evaluate(() => window.spoken), []);
      await command('palabras sin sentido');
      assert.match(await status.textContent(), /No entendí/);
      const starts = await page.evaluate(() => window.starts);
      await page.waitForTimeout(150);
      assert.equal(await page.evaluate(() => window.starts), starts);
      await command('Mi carrito');
      await command('vaciar carrito');
      const beforeConfirm = await page.evaluate(() => window.starts);
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => window.starts), beforeConfirm);
      await press(page.getByRole('button', { name: 'Responder por voz: sí o no' }));
      await page.waitForTimeout(30);
      await page.evaluate(() => window.deliver('no'));
      await page.waitForTimeout(100);
      assert.match(await status.textContent(), /cancelada/);
      await command('Accesibilidad');
      await page.getByRole('checkbox', { name: 'Lectura en voz alta', exact: true }).check();
      await press(page.getByRole('button', { name: 'Guardar y continuar' }));
      await page.waitForTimeout(100);
      assert.ok((await page.evaluate(() => window.spoken)).length > 0, 'Explicit reading mode permits automatic navigation speech');
      const spoken = await page.evaluate(() => window.spoken.length);
      await press(commandButton);
      await page.waitForTimeout(50);
      const events = await page.evaluate(() => window.events);
      assert.equal(events[events.lastIndexOf('start') - 1], 'pause');
      await page.evaluate(() => window.deliver('Presupuesto'));
      await page.waitForTimeout(100);
      assert.equal(await page.evaluate(() => window.spoken.length), spoken, 'Voice navigation must not restart speech');
      await command('Leer pantalla');
      assert.equal(await page.evaluate(() => window.spoken.length), spoken + 1, 'An explicit reading command still speaks');
      await press(commandButton);
      await page.waitForTimeout(50);
      await press(page.getByRole('button', { name: 'Detener escucha', exact: true }));
      await page.waitForTimeout(50);
      assert.match(await status.textContent(), /detenida/);
      assert.equal(await page.evaluate(() => window.spoken.length), spoken + 1);
      if (width === 390) {
        await page.clock.install();
        await press(commandButton);
        await page.clock.runFor(16000);
        assert.match(await status.textContent(), /No escuché/);
        assert.equal(await commandButton.isEnabled(), true);
      }
      await page.reload(); await page.waitForTimeout(150);
      assert.deepEqual(await page.evaluate(() => window.spoken), []);
      assert.equal(await page.evaluate(() => window.starts), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `.reference/voice-session/welcome-${width}.png`, fullPage: true });
      assert.deepEqual(errors, []);
      console.log({ width, silentEntry: true, explicitMic: true, helpFocus: true, voiceNavigation: true, confirmation: true, sessionReading: true, reloadSilent: true, errors });
      await page.close();
    }
    for (const mode of ['unsupported', 'denied']) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
      await setup(page, mode);
      await page.getByRole('button', { name: 'Dar un comando por voz', exact: true }).tap();
      await page.waitForTimeout(100);
      const message = await page.locator('.voice-commands [role=status]').textContent();
      assert.match(message, mode === 'unsupported' ? /no están disponibles/ : /No pudimos acceder/);
      assert.deepEqual(await page.evaluate(() => window.spoken), []);
      await page.getByRole('button', { name: 'Continuar sin configurar', exact: true }).tap();
      assert.match(await page.title(), /Inicio/);
      console.log({ mode, silentError: true, navigationWorks: true });
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
