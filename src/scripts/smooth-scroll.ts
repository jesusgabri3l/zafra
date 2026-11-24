import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './motion';
import { setBottleVisible } from './bottle';

let lenis: Lenis | undefined;

export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
}

// Salto a un capítulo sin enseñar lo de en medio: la botella se esconde mientras el scroll cruza el recorrido
// (el timeline la deja en el estado de destino) y vuelve al llegar.
function jumpTo(target: HTMLElement) {
  setBottleVisible(false, 0.15);
  lenis!.scrollTo(target, { duration: 1.2, onComplete: () => setBottleVisible(true, 0.2) });
}

export function startSmoothScroll() {
  if (prefersReducedMotion()) return;

  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Los enlaces ancla pasan por Lenis para que no peleen con el scroll suave.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector<HTMLElement>(link.getAttribute('href') ?? '');
      if (!target) return;
      event.preventDefault();
      if (link.hasAttribute('data-jump')) jumpTo(target);
      else lenis!.scrollTo(target, { offset: -40 });
    });
  });
}
