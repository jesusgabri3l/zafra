import { gsap } from 'gsap';
import { bumpBottle, intro, stage } from './bottle';
import { prefersReducedMotion } from './motion';
import { setScrollLocked } from './smooth-scroll';

// Sin loader: mientras carga (fuentes + frutas del hero decodificadas) se ve el campo maracuyá liso. Cuando todo está listo
// arranca la intro por tiempo (~1,7 s): letras en burbujas, la botella cae a la cresta, la maracuyá cae y se parte, entra la chapa.
const TIMEOUT = 10_000; // red caída o lenta: sale igual con lo que haya

// `prepare` arma el layout y el timeline del recorrido; `intro` entrega la botella a ese estado al terminar.
export async function startIntro(prepare: () => void) {
  const root = document.documentElement;
  const reduced = prefersReducedMotion();
  history.scrollRestoration = 'manual'; // el recorrido arranca siempre desde la portada
  window.scrollTo(0, 0);
  setScrollLocked(true);

  // Los brochazos se pintan mientras carga y se quedan de fondo del hero.
  const brush = document.querySelector<HTMLElement>('[data-hero-brush]');
  const strokes = [...document.querySelectorAll<HTMLElement>('[data-hero-stroke]')];
  const painted = new Promise<void>((resolve) => (reduced || !brush ? resolve() : void gsap.to(strokes, { '--p': 1, duration: 0.7, ease: 'power1.inOut', stagger: 0.22, onComplete: resolve })));

  const whole = document.querySelector<HTMLImageElement>('[data-whole]');
  const decodeLater = [...document.querySelectorAll<HTMLImageElement>('.hero__fruit img.fruit:not([data-whole])')];
  for (const image of decodeLater) void image.decode().catch(() => undefined);

  const tasks = [document.fonts.ready, painted];
  if (whole) tasks.push(whole.decode().catch(() => undefined));
  await Promise.race([Promise.all(tasks), new Promise((resolve) => setTimeout(resolve, TIMEOUT))]);

  root.setAttribute('data-ready', ''); // kicker + brochazos; el titular y la fruta siguen ocultos hasta la intro

  const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 800));
  idle(() => {
    for (const image of document.querySelectorAll<HTMLImageElement>('.manifesto img.fruit, .fill img.fruit')) {
      void image.decode().catch(() => undefined);
    }
  });

  const V = document.querySelector<HTMLElement>('.hero')!.offsetHeight;
  const wholeEl = document.querySelector('[data-whole]')!;
  const halves = [...document.querySelectorAll<HTMLElement>('[data-half]')];
  const drops = [...document.querySelectorAll<HTMLElement>('[data-drop]')];
  const letters = [...document.querySelectorAll('.hero__title [data-char]')];
  const boxWidth = document.querySelector<HTMLElement>('[data-fruit-box]')!.offsetWidth;
  const splitAt = 1;

  // La botella parte de arriba, ya con la pose del recorrido en scroll 0.
  Object.assign(intro, { x: stage.x, y: -stage.height, height: stage.height, rotZ: 0, fill: 1, sweat: 0, chapter: 2 });

  const finish = () => {
    intro.active = false;
    root.removeAttribute('data-loading');
    setScrollLocked(false);
    prepare(); // al volver el scroll de la página cambian los anchos: se mide otra vez
  };

  const tl = gsap.timeline({ paused: true, onComplete: finish });
  tl.fromTo(letters, { y: 'random(60, 120)', autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.6)', stagger: { each: 0.025, from: 'random' } }, 0);
  tl.fromTo(intro, { y: -stage.height }, { y: stage.y, duration: 0.7, ease: 'back.out(1.3)' }, 0.2);
  tl.call(() => bumpBottle(true), [], 0.45); // aterriza en la cresta

  // La maracuyá entera cae, choca con la cresta y se parte. Solo posición, giro y escala: nunca opacidad.
  tl.fromTo(wholeEl, { y: -V * 0.9, rotation: -30, visibility: 'hidden' }, { y: 0, rotation: 0, visibility: 'visible', duration: 0.5, ease: 'back.out(1.2)' }, 0.5);
  tl.fromTo(wholeEl, { visibility: 'visible' }, { visibility: 'hidden', duration: 0.001, immediateRender: false }, splitAt);
  halves.forEach((half) => {
    const direction = Number(half.dataset.half);
    const anchor = { xPercent: direction < 0 ? -100 : 0, yPercent: -30 }; // la mitad izquierda se apoya en el centro por su borde derecho
    tl.fromTo(half, { visibility: 'hidden', x: 0, rotation: 0, ...anchor }, { visibility: 'visible', x: direction * boxWidth * 0.45, rotation: direction * 12, ...anchor, duration: 0.35, ease: 'back.out(1.7)' }, splitAt);
  });
  drops.forEach((drop) => {
    const angle = (Number(drop.dataset.angle) * Math.PI) / 180;
    const distance = Number(drop.dataset.distance) * boxWidth;
    tl.fromTo(
      drop,
      { visibility: 'hidden', x: 0, y: 0, scale: 0.2, rotation: 0, xPercent: -50, yPercent: -50 },
      { visibility: 'visible', x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, scale: 1, rotation: Number(drop.dataset.angle) * 0.3, xPercent: -50, yPercent: -50, duration: 0.4, ease: 'power2.out' },
      splitAt,
    );
  });

  tl.fromTo('[data-nail-cap]', { scale: 0 }, { scale: 1, duration: 0.7, ease: 'back.out(2)' }, 0.9);
  tl.to({}, { duration: 0.1 }, 1.6); // la barra y el sonido entran cuando todo terminó

  if (reduced) {
    tl.progress(1); // sin movimiento: el hero ya armado
    finish();
    return;
  }
  tl.play();
}
