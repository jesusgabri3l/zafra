import { gsap } from 'gsap';
import { prefersReducedMotion } from './motion';

const DRIFT_PX_PER_SECOND = 40;
const REPEATS = 14;
const SAMPLES = 160;

const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
// Ruido de valor lineal: borde irregular y dientes en las puntas rasgadas.
const noise = (t: number, seed: number) => {
  const i = Math.floor(t);
  const f = t - i;
  return hash(i + seed) * (1 - f) + hash(i + 1 + seed) * f;
};

// Contorno de la cinta: dos bordes largos con ruido a ambos lados de la ruta y puntas rasgadas (dientes) en los extremos.
function ribbonOutline(path: SVGPathElement, width: number, half: number) {
  const length = path.getTotalLength();
  const inset = width * 0.02;
  const points: { x: number; y: number; nx: number; ny: number; tx: number; ty: number }[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const at = (i / SAMPLES) * length;
    const a = path.getPointAtLength(Math.max(0, at - 1));
    const b = path.getPointAtLength(Math.min(length, at + 1));
    const p = path.getPointAtLength(at);
    if (p.x < inset || p.x > width - inset) continue;
    const size = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const tx = (b.x - a.x) / size;
    const ty = (b.y - a.y) / size;
    points.push({ x: p.x, y: p.y, tx, ty, nx: -ty, ny: tx });
  }
  const edge = (index: number, side: 1 | -1, seed: number) => side * (half + (noise(index / 5, seed) - 0.5) * half * 0.1 + (hash(index + seed) - 0.5) * 2);
  const top = points.map((p, i) => [p.x + p.nx * edge(i, -1, 11), p.y + p.ny * edge(i, -1, 11)]);
  const bottom = points.map((p, i) => [p.x + p.nx * edge(i, 1, 57), p.y + p.ny * edge(i, 1, 57)]);
  // Punta rasgada: de un borde al otro, cada punto avanza una cantidad irregular hacia afuera.
  const tip = (p: (typeof points)[number], direction: 1 | -1, seed: number, from: 1 | -1) => {
    const steps = 12;
    return Array.from({ length: steps + 1 }, (_, k) => {
      const across = from * (-1 + (2 * k) / steps) * half;
      const out = direction * (4 + noise(k * 1.4, seed) * half * 0.32 + hash(k + seed) * 5);
      return [p.x + p.nx * across + p.tx * out, p.y + p.ny * across + p.ty * out];
    });
  };
  const first = points[0];
  const last = points[points.length - 1];
  const ring = [...top, ...tip(last, 1, 3, 1), ...bottom.reverse(), ...tip(first, -1, 29, -1)];
  return `M ${ring.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')} Z`;
}

// El chorro es el divisor mora / mandarina: una banda gruesa de dos ondas que cruza todo el ancho; su centro es la ruta del texto.
export function startSpout() {
  const svg = document.querySelector<SVGSVGElement>('[data-spout]');
  const bands = svg?.querySelectorAll<SVGPathElement>('[data-spout-band]');
  const shadow = svg?.querySelector<SVGPathElement>('[data-spout-shadow]');
  const clip = svg?.querySelector<SVGPathElement>('[data-spout-clip]');
  const path = svg?.querySelector<SVGPathElement>('[data-spout-path]');
  const text = svg?.querySelector<SVGTextPathElement>('[data-spout-text]');
  if (!svg || !bands || !shadow || !clip || !path || !text) return { layout() {}, setScroll(_pixels: number) {} };

  let unit = 1;
  let scrollShift = 0;
  let drift = 0;
  let visible = false;

  const apply = () => {
    const shift = (scrollShift + drift) % unit;
    text.setAttribute('startOffset', String(shift - unit));
  };

  // Redibuja ruta y banda con el tamaño real de la sección (al cargar y al redimensionar).
  const layout = () => {
    const { width, height } = svg.getBoundingClientRect();
    const screen = window.innerHeight;
    const isNarrow = width < 768;
    const bandWidth = screen * (isNarrow ? 0.1 : 0.16);
    const wave = screen * 0.08;
    const middle = height / 2;
    const d = `M -60 ${middle} C ${width * 0.12} ${middle - 2 * wave}, ${width * 0.3} ${middle - 2 * wave}, ${width * 0.5} ${middle} S ${width * 0.88} ${middle + 2 * wave}, ${width + 60} ${middle}`;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    path.setAttribute('d', d);
    const outline = ribbonOutline(path, width, bandWidth / 2);
    bands.forEach((band) => band.setAttribute('d', outline));
    shadow.setAttribute('d', outline);
    clip.setAttribute('d', outline);
    svg.style.setProperty('--spout-text-size', `${Math.max(36, screen * 0.09)}px`);
    unit = text.getComputedTextLength() / REPEATS || 1;
    apply();
  };

  if (!prefersReducedMotion()) {
    new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: '100px' }).observe(svg);
    gsap.ticker.add((_time, deltaTime) => {
      if (!visible) return;
      drift += (deltaTime / 1000) * DRIFT_PX_PER_SECOND;
      apply();
    });
  }

  return {
    layout,
    // El texto avanza 1:1 con el scroll (más la marcha propia).
    setScroll(pixels: number) {
      scrollShift = pixels;
      if (visible) apply();
    },
  };
}
