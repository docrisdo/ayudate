const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true });
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('ayudate-preferences', JSON.stringify({ voice: true, autoRead: true, voiceCommands: true, highContrast: true }));
      window.spoken = [];
      Object.defineProperty(window, 'speechSynthesis', { value: { speak(u) { window.spoken.push(u.text); u.onstart?.(); setTimeout(() => u.onend?.(), 10); }, cancel() {}, resume() {}, pause() {} } });
    });
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(300);
    assert.deepEqual(await page.evaluate(() => window.spoken), [], 'Stored preferences must not speak on entry');
    await page.getByRole('button', { name: 'Continuar sin configurar', exact: true }).click();
    await page.waitForTimeout(200);
    assert.deepEqual(await page.evaluate(() => window.spoken), [], 'Navigation must remain silent');
    console.log('PASS: silent entry and navigation with old preferences');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
