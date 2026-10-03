// MeshSync dashboard browser-automation smoke test (Playwright on Edge)
// Covers: page load, login form, failed-login UX, authenticated shell (if creds set)
// Run: node dashboard-smoke.js        (skips valid-login)
//   or: E2E_USER=.. E2E_PASS=.. node dashboard-smoke.js
const { chromium } = require('playwright');
const BASE = 'https://meshsync-command-center.pages.dev';
const E2E_USER = process.env.E2E_USER || '';
const E2E_PASS = process.env.E2E_PASS || '';
const results = [];
const t = (name, ok, extra = '') => {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
};

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();

  const resp = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  t('dashboard page loads', resp && resp.status() === 200, `HTTP ${resp && resp.status()}`);

  await page.waitForTimeout(3000);
  t('login form renders', await page.locator('input[type="password"]').count() > 0);

  // Wrong credentials must show a visible rejection
  await page.locator('input[type="email"]').first().fill('anjali@meshsync.lk');
  await page.locator('input[type="password"]').first().fill('definitely-wrong');
  await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
  try {
    await page.waitForSelector('text=/invalid email or password/i', { timeout: 20000 });
    t('wrong-password rejection shown', true, '"Invalid email or password"');
  } catch {
    t('wrong-password rejection shown', false, 'error text never appeared');
  }

  if (E2E_USER && E2E_PASS) {
    await page.locator('input[type="email"]').first().fill(E2E_USER);
    await page.locator('input[type="password"]').first().fill(E2E_PASS);
    await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
    try {
      await page.waitForFunction(() => !document.querySelector('input[type="password"]'), null, { timeout: 30000 });
      const content = await page.content();
      t('valid login reaches app shell', /incident|cluster|squad|map/i.test(content), `url=${page.url()}`);
      await page.screenshot({ path: 'dashboard-logged-in.png' });
    } catch {
      t('valid login reaches app shell', false, `still on ${page.url()}`);
    }
  } else {
    console.log('SKIP  valid-login test — set E2E_USER/E2E_PASS to enable');
  }

  await browser.close();
  const passN = results.filter(r => r.ok).length;
  console.log(`\n${passN}/${results.length} browser checks passed`);
  require('fs').writeFileSync('e2e-results.json', JSON.stringify(results, null, 2));
  process.exit(passN === results.length ? 0 : 1);
})().catch(e => { console.error('E2E crash:', e.message); process.exit(1); });
