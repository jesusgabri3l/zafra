// Capturas de PageSpeed para el README (tema oscuro, mismo formato que TROCHA) desde la API de PageSpeed Insights.
// Uso: node scripts/pagespeed-shots.mjs [url] [fecha]   (lee PSI_API_KEY si existe; sin clave la cuota es baja)
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const url = process.argv[2] ?? 'https://jesusgabri3l.github.io/zafra/';
const stamp = process.argv[3] ?? new Date().toISOString().slice(0, 10);
const CATEGORIES = [['performance', 'Performance'], ['accessibility', 'Accessibility'], ['best-practices', 'Best Practices'], ['seo', 'SEO']];
const METRICS = [['first-contentful-paint', 'First Contentful Paint'], ['largest-contentful-paint', 'Largest Contentful Paint'], ['total-blocking-time', 'Total Blocking Time'], ['cumulative-layout-shift', 'Cumulative Layout Shift'], ['speed-index', 'Speed Index']];
const COLORS = { pass: '#0cce6b', average: '#ffa400', fail: '#ff4e42' };

const rating = (score) => (score >= 0.9 ? 'pass' : score >= 0.5 ? 'average' : 'fail');

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const dir = join(process.env.LOCALAPPDATA ?? '', 'ms-playwright');
  if (!existsSync(dir)) return undefined;
  const folder = readdirSync(dir).filter((name) => name.startsWith('chromium-')).sort().pop();
  const candidate = folder && join(dir, folder, 'chrome-win64', 'chrome.exe');
  return candidate && existsSync(candidate) ? candidate : undefined;
}

async function runPsi(strategy) {
  const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  api.searchParams.set('url', url);
  api.searchParams.set('strategy', strategy);
  for (const [id] of CATEGORIES) api.searchParams.append('category', id);
  if (process.env.PSI_API_KEY) api.searchParams.set('key', process.env.PSI_API_KEY);
  const response = await fetch(api);
  if (!response.ok) throw new Error(`PSI ${strategy}: ${response.status} ${await response.text()}`);
  return (await response.json()).lighthouseResult;
}

function gauge(score, label) {
  const value = Math.round(score * 100);
  const color = COLORS[rating(score)];
  const circumference = 2 * Math.PI * 30;
  return `<div class="gauge"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" stroke="${color}33"/><circle cx="36" cy="36" r="30" stroke="${color}" stroke-dasharray="${(score * circumference).toFixed(1)} ${circumference.toFixed(1)}" transform="rotate(-90 36 36)"/></svg><b style="color:${color}">${value}</b><span>${label}</span></div>`;
}

function metric(audit, label) {
  const kind = rating(audit.score ?? 0);
  return `<div class="metric"><i class="${kind}"></i><span>${label}</span><b style="color:${COLORS[kind]}">${audit.displayValue.replace(/\s/g, ' ')}</b></div>`;
}

function page(result) {
  return `<!doctype html><html><head><style>
  body { margin: 0; background: #202124; font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #e8eaed; width: 750px; }
  .gauges { display: flex; justify-content: center; gap: 30px; padding: 6px 0 12px; border-bottom: 1px solid #5f6368; }
  .gauge { position: relative; width: 60px; display: flex; flex-direction: column; align-items: center; }
  .gauge svg { width: 36px; height: 36px; fill: none; stroke-width: 6; }
  .gauge b { position: absolute; top: 9px; font: 12px/18px 'Roboto Mono', Consolas, monospace; }
  .gauge span { margin-top: 10px; font-size: 9px; font-weight: 600; white-space: nowrap; }
  .metrics { display: grid; grid-template-columns: 1fr 1fr; column-gap: 24px; }
  .metric { display: grid; grid-template-columns: 26px 1fr; padding: 13px 0 6px; border-bottom: 1px solid #5f6368; }
  .metric span { font-size: 13px; }
  .metric b { grid-column: 2; font-size: 23px; font-weight: 400; margin-top: 2px; }
  i { width: 9px; height: 9px; margin: 4px 0 0 10px; }
  i.pass { background: ${COLORS.pass}; border-radius: 50%; }
  i.average { background: ${COLORS.average}; }
  i.fail { width: 0; height: 0; border: 5px solid transparent; border-bottom: 9px solid ${COLORS.fail}; border-top: 0; }
  </style></head><body>
  <div class="gauges">${CATEGORIES.map(([id, label]) => gauge(result.categories[id].score, label)).join('')}</div>
  <div class="metrics">${METRICS.map(([id, label]) => metric(result.audits[id], label)).join('')}</div>
  </body></html>`;
}

const browser = await chromium.launch({ executablePath: findChromium() });
try {
  const rows = [];
  for (const strategy of ['mobile', 'desktop']) {
    const result = await runPsi(strategy);
    const tab = await browser.newPage({ viewport: { width: 750, height: 300 }, deviceScaleFactor: 2 });
    await tab.setContent(page(result));
    const out = join(root, 'docs', 'screenshots', `pagespeed-${strategy}-${stamp}.png`);
    await tab.screenshot({ path: out, fullPage: true });
    await tab.close();
    console.log(out, CATEGORIES.map(([id]) => Math.round(result.categories[id].score * 100)).join(' / '));
    rows.push(METRICS.slice(0, 4).map(([id]) => result.audits[id].displayValue.replace(/\s/g, ' ')));
  }
  // Tabla lista para el README
  const order = [0, 1, 3, 2]; // FCP, LCP, CLS, TBT
  for (const index of order) console.log(`| ${METRICS[index][1]} | ${rows[0][index]} | ${rows[1][index]} |`);
} finally {
  await browser.close();
}
