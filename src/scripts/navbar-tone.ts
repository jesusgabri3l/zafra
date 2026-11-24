import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// La barra cambia de color según el capítulo que tiene debajo (data-bar = dark | light | order | footer; footer = dark sin logo).
// `order` es como dark, pero esconde el botón PEDIR: ahí ya está el botón grande.
export function startNavbarTone() {
  const navbar = document.querySelector<HTMLElement>('[data-navbar]');
  if (!navbar) return;

  // Con scroll animado hay secciones fijas y movidas por transform: el tono sale de lo que realmente está bajo la barra.
  if (document.documentElement.classList.contains('is-scrub')) {
    let lastScroll = -1;
    gsap.ticker.add(() => {
      if (window.scrollY === lastScroll) return;
      lastScroll = window.scrollY;
      const under = document.elementsFromPoint(window.innerWidth / 2, 64).find((element) => element.closest('[data-bar]') && !navbar.contains(element));
      const tone = under?.closest<HTMLElement>('[data-bar]')?.dataset.bar;
      if (tone) navbar.dataset.tone = tone;
    });
    return;
  }

  document.querySelectorAll<HTMLElement>('[data-bar]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 64px',
      end: 'bottom 64px',
      onToggle: ({ isActive }) => {
        if (isActive) navbar.dataset.tone = section.dataset.bar;
      },
    });
  });
}
