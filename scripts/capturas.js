#!/usr/bin/env node
/**
 * Capturas de pantallas para revisión visual (web o app en Expo Web), en 1280 claro y 375 oscuro.
 * Entra con la cuenta de prueba consumidor (users.md) contra la API de PRODUCCIÓN: solo navega, no escribe nada.
 *
 * Uso (desde la raíz):
 *   node scripts/capturas.js web /mascotas /mascotas/<id>?tab=historial      # web en localhost:3001 (npm run dev)
 *   node scripts/capturas.js app /mascotas                                   # app en localhost:3000 (expo start --web)
 * Las imágenes quedan en output/capturas/<plataforma>-<ruta>-<ancho>.png. Mira cada una antes de dar algo por bueno.
 * Avisa «DESBORDE» si la página es más ancha que la pantalla (scroll horizontal = bug).
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || '/home/epigibson/.npm/_npx/31e32ef8478fbf80/node_modules/playwright-core');

const [platform = 'web', ...routes] = process.argv.slice(2);
const BASE = platform === 'app' ? 'http://localhost:3000' : 'http://localhost:3001';
const EMAIL = process.env.CAPTURAS_EMAIL || 'test.consumidor@example.com';
const PASS = process.env.CAPTURAS_PASS || 'MichiTest2026!';
const OUT = path.join(__dirname, '..', 'output', 'capturas');
const VIEWPORTS = platform === 'app' ? [[375, 812, 'light'], [375, 812, 'dark']] : [[1280, 800, 'light'], [375, 812, 'dark']];
const WAIT = platform === 'app' ? 7000 : 4000;

(async () => {
  if (!routes.length) { console.error('Indica al menos una ruta, p. ej. /mascotas'); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [w, h, scheme] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`); await page.waitForTimeout(WAIT);
    await page.locator('input').first().fill(EMAIL);
    await page.locator('input[type=password]').first().fill(PASS);
    await page.keyboard.press('Enter'); await page.waitForTimeout(WAIT);
    for (const route of routes) {
      await page.goto(BASE + route); await page.waitForTimeout(WAIT);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > w) console.log(`DESBORDE ${route} a ${w}px: la página mide ${sw}px`);
      const name = `${platform}-${route.replace(/[^\w]+/g, '_').replace(/^_|_$/g, '') || 'inicio'}-${w}-${scheme}.png`;
      await page.screenshot({ path: path.join(OUT, name), fullPage: platform === 'web' });
      console.log('✓', path.join('output/capturas', name));
    }
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
