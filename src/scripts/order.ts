import { gsap } from 'gsap';
import { FLAVORS, formatPrice } from '../data/flavors';
import { SITE } from '../config/site';
import { prefersReducedMotion } from './motion';
import { showFlavor } from './bottle';

// Six-pack: 3 contadores que suman SIZE. Tocar una chapa (o su +) muestra ese sabor en la botella.
export function startOrder() {
  const section = document.querySelector<HTMLElement>('[data-order]');
  const summary = section?.querySelector<HTMLElement>('[data-order-summary]');
  const total = section?.querySelector<HTMLElement>('[data-order-total]');
  const hint = section?.querySelector<HTMLElement>('[data-order-hint]');
  const whatsapp = section?.querySelector<HTMLAnchorElement>('[data-order-whatsapp]');
  if (!section || !summary || !total || !hint || !whatsapp) return;

  const size = Number(section.dataset.size);
  const price = Number(section.dataset.price);
  const rows = [...section.querySelectorAll<HTMLElement>('[data-order-flavor]')];
  const counts = rows.map((row) => Number(row.querySelector('[data-order-count]')!.textContent));
  const sum = () => counts.reduce((acc, count) => acc + count, 0);

  const orderMessage = () => {
    const parts = FLAVORS.flatMap(({ name }, index) => (counts[index] ? [`${counts[index]} de ${name.toLowerCase()}`] : []));
    return `Hola ZAFRA, quiero armar un six-pack: ${parts.join(', ')}. Total: ${formatPrice(sum() * price)}.`;
  };

  const refresh = () => {
    const picked = sum();
    const isFull = picked === size;
    summary.textContent = `${picked} de ${size}`;
    total.textContent = formatPrice(picked * price);
    hint.textContent = isFull ? 'Para agregar otra, quita una.' : `Te faltan ${size - picked}.`;

    rows.forEach((row, index) => {
      row.querySelector('[data-order-count]')!.textContent = String(counts[index]);
      row.querySelector<HTMLButtonElement>('[data-order-step="-1"]')!.disabled = counts[index] === 0;
      row.querySelector<HTMLButtonElement>('[data-order-step="1"]')!.disabled = isFull;
    });

    whatsapp.setAttribute('aria-disabled', String(!isFull));
    if (isFull) whatsapp.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(orderMessage())}`;
    else whatsapp.removeAttribute('href');
  };

  const pick = (index: number) => {
    rows.forEach((row, rowIndex) => row.querySelector('[data-order-pick]')!.setAttribute('aria-pressed', String(rowIndex === index)));
    showFlavor(index);
    if (prefersReducedMotion()) return;
    gsap.fromTo(rows[index].querySelector('.cap'), { rotation: 0 }, { rotation: 360, duration: 0.4, ease: 'back.out(1.6)' });
  };

  rows.forEach((row, index) => {
    row.querySelector('[data-order-pick]')!.addEventListener('click', () => pick(index));
    row.querySelectorAll<HTMLButtonElement>('[data-order-step]').forEach((button) =>
      button.addEventListener('click', () => {
        const step = Number(button.dataset.orderStep);
        counts[index] = Math.max(0, counts[index] + step);
        if (step > 0) pick(index);
        refresh();
      }),
    );
  });

  whatsapp.addEventListener('click', (event) => {
    if (whatsapp.getAttribute('aria-disabled') === 'true') event.preventDefault();
  });

  refresh();
}
