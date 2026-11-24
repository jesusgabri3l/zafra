// OG 1200×630 + capturas README (desktop + móvil) + PNG PageSpeed desde reportes Lighthouse.
// Uso: npm run build && npm run og && npm run build
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs', 'screenshots');
const reportsDir = join(root, 'docs', 'reports');
const stamp = '2026-11-24';
const outOg = join(root, 'public', 'og.jpg');
const port = 3198;
const base = `http://127.0.0.1:${port}`;

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** Vista completa en móvil (viewport), no recorte de elemento sticky. */
const MOBILE_VIEWS = [
  { name: `mobile-hero-${stamp}`, scroll: async (page) => page.evaluate(() => scrollTo(0, 0)) },
  {
    name: `mobile-flavors-${stamp}`,
    scroll: async (page) => {
      await page.locator('[data-flavor-item]').nth(1).scrollIntoViewIfNeeded();
      await page.evaluate(() => scrollBy(0, 80));
    },
  },
  { name: `mobile-order-${stamp}`, scroll: async (page) => page.locator('#pedido').scrollIntoViewIfNeeded() },
];

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const dir = join(process.env.LOCALAPPDATA ?? '', 'ms-playwright');
  if (!existsSync(dir)) return undefined;
  const folder = readdirSync(dir).filter((name) => name.startsWith('chromium-')).sort().pop();
  const candidate = folder && join(dir, folder, 'chrome-win64', 'chrome.exe');
  return candidate && existsSync(candidate) ? candidate : undefined;
}

async function waitForServer(timeoutMs = 45_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(`${base}/`)).ok) return;
    } catch {
      /* */
    }
    await new Promise((done) => setTimeout(done, 250));
  }
  throw new Error(`No responde ${base}`);
}

function serve() {
  return spawn('npx', ['serve@14.2.4', 'dist', '-l', String(port)], { cwd: root, shell: true, stdio: 'ignore' });
}

function killServer(proc) {
  if (!proc?.pid) return;
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
  else proc.kill();
}

async function waitHeroReady(page) {
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.evaluate(() => {
    history.scrollRestoration = 'manual';
    scrollTo(0, 0);
  });
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-loading'), undefined, { timeout: 25_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

async function capturePageSpeed(executablePath) {
  const pairs = [
    ['lighthouse-mobile.html', `pagespeed-mobile-${stamp}.png`],
    ['lighthouse-desktop.html', `pagespeed-desktop-${stamp}.png`],
  ];
  const browser = await chromium.launch({ executablePath });
  try {
    for (const [report, out] of pairs) {
      const file = join(reportsDir, report);
      if (!existsSync(file)) {
        console.warn(`skip PageSpeed PNG (falta ${report}; corre lighthouse sobre la URL live)`);
        continue;
      }
      const page = await browser.newPage({ viewport: { width: 480, height: 1400 }, deviceScaleFactor: 2 });
      await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' });
      await page.addStyleTag({
        content: `.lh-topbar, .lh-footer, .lh-meta, .lh-category:not(#performance), #agentic-browsing, .lh-fraction__wrapper { display: none !important; }
#performance .lh-category-header, #performance .lh-filmstrip { display: none !important; }`,
      });
      const scores = page.locator('.lh-header-container');
      const metrics = page.locator('#performance .lh-metrics-container');
      await scores.waitFor({ timeout: 15_000 });
      await metrics.waitFor({ timeout: 15_000 });
      const a = await scores.screenshot({ type: 'png' });
      const b = await metrics.screenshot({ type: 'png' });
      const top = sharp(a);
      const metaA = await top.metadata();
      const metaB = await sharp(b).metadata();
      const width = Math.max(metaA.width ?? 0, metaB.width ?? 0);
      const height = (metaA.height ?? 0) + (metaB.height ?? 0) + 8;
      const topPadded = await top
        .extend({
          top: 0,
          bottom: 8,
          left: 0,
          right: Math.max(0, width - (metaA.width ?? 0)),
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toBuffer();
      const bottomPadded = await sharp(b)
        .extend({
          left: 0,
          right: Math.max(0, width - (metaB.width ?? 0)),
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toBuffer();
      const outPath = join(docsDir, out);
      await sharp({
        create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
      })
        .composite([
          { input: topPadded, top: 0, left: 0 },
          { input: bottomPadded, top: metaA.height ?? 0, left: 0 },
        ])
        .png()
        .toFile(outPath);
      console.log(outPath);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  if (!existsSync(join(root, 'dist', 'index.html'))) {
    throw new Error('Falta dist/: corre npm run build');
  }
  const executablePath = findChromium();
  if (!executablePath) {
    throw new Error('Chromium de Playwright no encontrado. Corre: npx playwright install chromium');
  }

  mkdirSync(join(root, 'public'), { recursive: true });
  mkdirSync(docsDir, { recursive: true });
  mkdirSync(reportsDir, { recursive: true });

  for (const legacy of readdirSync(docsDir).filter((name) => name.endsWith('-v2.webp'))) {
    unlinkSync(join(docsDir, legacy));
  }

  const server = serve();
  const browser = await chromium.launch({ executablePath });
  let context;
  try {
    await waitForServer();

    // OG + hero escritorio (misma vista ancha)
    context = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });
    let page = await context.newPage();
    await waitHeroReady(page);
    const heroPng = await page.screenshot({ type: 'png' });
    await sharp(heroPng).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 88, mozjpeg: true }).toFile(outOg);
    await sharp(heroPng).jpeg({ quality: 90, mozjpeg: true }).toFile(join(docsDir, `desktop-hero-${stamp}.jpg`));
    console.log(outOg);
    console.log(join(docsDir, `desktop-hero-${stamp}.jpg`));
    await context.close();

    // Móvil
    context = await browser.newContext({
      viewport: MOBILE,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    page = await context.newPage();
    await waitHeroReady(page);
    for (const { name, scroll } of MOBILE_VIEWS) {
      await scroll(page);
      await page.waitForTimeout(700);
      await sharp(await page.screenshot({ type: 'png' }))
        .jpeg({ quality: 90, mozjpeg: true })
        .toFile(join(docsDir, `${name}.jpg`));
      console.log(join(docsDir, `${name}.jpg`));
    }
    await context.close();

    await capturePageSpeed(executablePath);
  } finally {
    await context?.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
    killServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack ?? error);
  process.exit(1);
});