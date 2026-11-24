// OG 1200×630 + capturas README desde el build estático (Playwright).
// Uso: npm run build && npm run og && npm run build
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs', 'screenshots');
const outOg = join(root, 'public', 'og.jpg');
const port = 3198;
const base = `http://127.0.0.1:${port}`;
const VIEW = { width: 1200, height: 630 };

/** Momentos para el README: selector y archivo (sin extensión). */
const SHOTS = [
  { selector: '.hero', file: 'hero-v2', crop: null },
  { selector: '.manifesto', file: 'manifesto-v2', crop: { w: 1200, h: 900 } },
  { selector: '.flavors', file: 'flavors-v2', crop: { w: 1200, h: 900 } },
  { selector: '.order', file: 'order-v2', crop: { w: 1200, h: 900 } },
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

async function toWebp(buf, target, crop) {
  let pipe = sharp(buf);
  if (crop) pipe = pipe.resize(crop.w, crop.h, { fit: 'cover', position: 'centre' });
  await pipe.webp({ quality: 88 }).toFile(`${target}.webp`);
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

  const server = serve();
  const browser = await chromium.launch({ executablePath });
  let context;
  try {
    await waitForServer();
    context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 2 });
    const page = await context.newPage();

    await waitHeroReady(page);

    const heroPng = await page.screenshot({ type: 'png' });
    await sharp(heroPng).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 88, mozjpeg: true }).toFile(outOg);
    console.log(outOg, '1200×630 (hero)');

    for (const { selector, file, crop } of SHOTS) {
      const el = page.locator(selector).first();
      await el.scrollIntoViewIfNeeded({ timeout: 15_000 });
      await page.waitForTimeout(600);
      const png = await el.screenshot({ type: 'png' });
      await toWebp(png, join(docsDir, file), crop);
      console.log(join(docsDir, `${file}.webp`));
    }
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