import { setSlotProvider, stage } from './bottle';

// Movimiento reducido: sin timeline. Cada sección trae su hueco para la botella (data-reduced-slot) y esta
// va al que tiene más cerca del centro de la pantalla, con la pose que declara (cuarto de luz, llenado, sudor, sabor).
export function startReducedBottle() {
  stage.follow = 1;
  const slots = [...document.querySelectorAll<HTMLElement>('[data-reduced-slot]')];
  setSlotProvider(() => {
    const middle = window.innerHeight / 2;
    const distance = (slot: HTMLElement) => {
      const { top, height } = slot.getBoundingClientRect();
      return Math.abs(top + height / 2 - middle);
    };
    return slots.reduce((nearest, slot) => (distance(slot) < distance(nearest) ? slot : nearest), slots[0]);
  });
}
