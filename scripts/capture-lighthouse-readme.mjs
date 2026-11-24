// PNG README (anillos + métricas) desde reportes Lighthouse HTML — datos alineados con PageSpeed/Lighthouse CLI.
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs', 'screenshots');
const reportsDir = join(root, 'docs', 'reports');
const stamp = '2026-11-24';

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const dir = join(process.env.LOCALAPPDATA ?? '', 'ms-playwright');
  if (!existsSync(dir)) return undefined;
  const folder = readdirSync(dir).filter((name) => name.startsWith('chromium-')).sort().pop();
  const candidate = folder && join(dir, folder, 'chrome-win64', 'chrome.exe');
  return candidate && existsSync(candidate) ? candidate : undefined;
}

async function captureCard(page, outPath) {
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
}

async function main() {
  const executablePath = findChromium();
  if (!executablePath) throw new Error('Chromium: npx playwright install chromium');
  mkdirSync(docsDir, { recursive: true });

  const pairs = [
    ['lighthouse-mobile.html', `pagespeed-mobile-${stamp}.png`],
    ['lighthouse-desktop.html', `pagespeed-desktop-${stamp}.png`],
  ];

  const browser = await chromium.launch({ executablePath });
  try {
    for (const [report, out] of pairs) {
      const file = join(reportsDir, report);
      if (!existsSync(file)) {
        console.warn(`skip ${out} (falta ${report})`);
        continue;
      }
      const page = await browser.newPage({
        viewport: { width: 480, height: 1400 },
        deviceScaleFactor: 2,
      });
      await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' });
      await page.addStyleTag({
        content: `.lh-topbar, .lh-footer, .lh-meta, .lh-category:not(#performance), #agentic-browsing, .lh-fraction__wrapper { display: none !important; }
#performance .lh-category-header, #performance .lh-filmstrip { display: none !important; }`,
      });
      await captureCard(page, join(docsDir, out));
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.stack ?? err);
  process.exit(1);
});