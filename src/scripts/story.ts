import { gsap } from 'gsap';
import { bumpBottle, stage } from './bottle';

// El recorrido es UN timeline cuyo tiempo es el scroll en píxeles (time = scrollY). Las secciones fijas son `position: sticky`,
// así las posiciones salen del layout. Se reconstruye al cambiar el tamaño. Cada propiedad de `stage` la toca una secuencia de
// tramos que no se pisan; todos menos el primero llevan immediateRender: false. La fruta nunca cambia de opacidad.

const query = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
const queryAll = <T extends Element>(selector: string) => [...document.querySelectorAll<T>(selector)];
const documentTop = (element: Element) => element.getBoundingClientRect().top + window.scrollY;
const TURN = 2 * Math.PI; // una vuelta completa en 2D
const noImmediate = { immediateRender: false } as const;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type Point = { x: number; y: number };

// Flecha de C: bézier cúbica con la punta orientada por su tangente final. `ease` convierte el avance en x en el avance en y
// de la curva: la botella (que se queda fija en x mientras pasa la pista) la recorre siguiendo su forma.
function arrowCurve(width: number, fromY: number, toY: number) {
  const x0 = width * 0.06;
  const x1 = width * 0.94;
  const dx = x1 - x0;
  const [start, c1, c2, end]: Point[] = [
    { x: x0, y: fromY },
    { x: x0 + dx * 0.4, y: fromY },
    { x: x1 - dx * 0.3, y: toY + (fromY - toY) * 0.45 },
    { x: x1, y: toY },
  ];
  const at = (t: number): Point => {
    const u = 1 - t;
    const mix = (a: number, b: number, c: number, d: number) => u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
    return { x: mix(start.x, c1.x, c2.x, end.x), y: mix(start.y, c1.y, c2.y, end.y) };
  };
  const yAtX = (x: number) => {
    let low = 0;
    let high = 1;
    for (let i = 0; i < 24; i++) {
      const middle = (low + high) / 2;
      if (at(middle).x < x) low = middle;
      else high = middle;
    }
    return at((low + high) / 2).y;
  };
  const angle = Math.atan2(end.y - c2.y, end.x - c2.x);
  const barb = (side: number) => `L ${(end.x + 30 * Math.cos(angle + Math.PI + side)).toFixed(1)} ${(end.y + 30 * Math.sin(angle + Math.PI + side)).toFixed(1)}`;
  return {
    curve: `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`,
    head: `M ${barb(-0.5).slice(2)} L ${end.x} ${end.y} ${barb(0.5)}`,
    ease: (progress: number) => (yAtX(clamp(progress * width, x0, x1)) - fromY) / (toY - fromY),
  };
}

// Offsets fijos por letra (no aleatorios): cada una llega a su sitio desde un lugar distinto.
const scatter = (index: number, spread: number) => ({
  x: (((index * 97) % 41) / 20 - 1) * spread,
  y: (((index * 61) % 37) / 18 - 1) * spread,
  rotation: (((index * 43) % 29) / 14 - 1) * 40,
});

export function startStory(onScroll: (scrollY: number) => void) {
  let context: gsap.Context | undefined;
  let timeline: gsap.core.Timeline | undefined;
  let lastScroll = -1;

  const build = () => {
    context?.revert();
    context = gsap.context(() => {
      timeline = buildTimeline();
    });
    lastScroll = -1;
  };

  gsap.ticker.add(() => {
    const scrollY = window.scrollY;
    if (!timeline || scrollY === lastScroll) return;
    lastScroll = scrollY;
    timeline.time(scrollY);
    onScroll(scrollY);
  });

  return { build };
}

function buildTimeline() {
  const V = query<HTMLElement>('.hero').offsetHeight; // alto de pantalla (100svh)
  const vw = document.documentElement.clientWidth;
  const mobile = vw < 768;
  const tablet = !mobile && vw < 1100; // la botella 0.66 V no cabe junto al titular: más chica y más a la izquierda
  const heroHeight = V * (mobile ? 0.4 : tablet ? 0.46 : 0.66); // más grande: la botella manda en el hero
  const centerHeight = V * (mobile ? 0.38 : tablet ? 0.5 : 0.64);
  const crestY = V * 0.84; // el canto del brochazo de A (-4°) está al 84svh en x = 84vw (HomeManifesto.astro)
  const heroX = vw * (mobile ? 0.74 : tablet ? 0.86 : 0.84); // a la derecha de "VERDAD": nunca la tapa
  const cantoDrop = (heroX - vw * 0.84) * -Math.tan((4 * Math.PI) / 180); // el canto sube hacia la derecha
  const heroY = crestY + cantoDrop - heroHeight * 0.48; // la base de la botella toca el canto
  const centerY = V * (mobile ? 0.77 : 0.5); // en móvil la botella va debajo del titular y las pastillas de B
  const betaX = vw * (mobile ? 0.7 : 0.8); // en B la botella va a la derecha del titular
  const tableY = V * (mobile ? 0.88 : 0.84) - heroHeight * 0.48; // la base de la botella apoya en la mesa de A
  const leanRotation = -(12 * Math.PI) / 180; // inclinación antes de cada viaje

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  gsap.set(stage, { x: heroX, y: heroY, height: heroHeight, rotZ: 0, fill: 1, sweat: 0, chapter: 2, flavorA: 0, flavorB: 0, mix: 0, follow: 0, orderZone: 0, floating: 0 });

  const manifesto = query<HTMLElement>('.manifesto');
  const hero = query<HTMLElement>('.hero');
  // A queda fija durante el paso horizontal (sticky): su sitio en el documento es el del contenedor + 100svh, no su rect actual.
  const aTop = documentTop(query('[data-pass]')) + V;
  const card = query<HTMLElement>('[data-manifesto-card]');
  const spout = query<HTMLElement>('.spout');
  const fill = query<HTMLElement>('.fill');
  const flavorsTop = documentTop(query('.flavors'));
  const pinTop = documentTop(query('[data-flavors-pin]'));
  const sliceTop = documentTop(query('[data-slice]'));
  const orderTop = documentTop(query('.order'));
  const card2 = query<HTMLElement>('[data-order-card]');

  // ---- Hero -> A (horizontal, durante el primer 100svh de scroll): la botella se inclina y rueda al sitio que A trae en su mesa ----
  const tableX = vw * (mobile ? 0.7 : tablet ? 0.66 : 0.82); // A deja la derecha libre para la botella
  tl.fromTo(stage, { x: heroX, y: heroY, rotZ: 0 }, { x: tableX, y: tableY, rotZ: leanRotation - TURN, duration: 0.95 * V, ease: 'power1.inOut', ...noImmediate }, 0.05 * V);

  // ---- La chapa sale del titular, crece, gira y cae de frente a clavarse en la tarjeta manifiesto: UN solo elemento 2D (.nail) ----
  const slotBox = query<HTMLElement>('[data-logo-slot]').getBoundingClientRect();
  const nail = query<HTMLElement>('[data-nail]');
  const nailCap = query<HTMLElement>('[data-nail-cap]');
  const nailSize = parseFloat(getComputedStyle(nail).width); // el elemento puede estar oculto aún (sin layout): se lee el ancho del CSS
  const nailAt = V; // se clava cuando A termina de llegar
  const tilt = -3; // la tarjeta va inclinada -3° (CSS: positivo = horario)
  const tiltRad = (tilt * Math.PI) / 180;
  // Punto del borde de arriba de la tarjeta donde va la chapa (12 % desde la izquierda: NAIL_LEFT de _manifesto.scss), ya con la
  // inclinación, en coordenadas de documento y con A en su sitio final. (dx, dy) es el punto respecto al centro, girado tiltRad.
  const NAIL_LEFT = 0.12;
  const dx = (NAIL_LEFT - 0.5) * card.offsetWidth;
  const dy = -card.offsetHeight / 2;
  const nailX = card.offsetLeft + card.offsetWidth / 2 + dx * Math.cos(tiltRad) - dy * Math.sin(tiltRad);
  const nailY = aTop + card.offsetTop + card.offsetHeight / 2 + dx * Math.sin(tiltRad) + dy * Math.cos(tiltRad);
  const slotScale = slotBox.width / nailSize;
  const heroBox = hero.getBoundingClientRect(); // el hero va fijo: el hueco se mide contra él, no contra el documento
  const slotX = slotBox.left - heroBox.left + slotBox.width / 2;
  const slotY = slotBox.top - heroBox.top + slotBox.height / 2;
  const cardExit = nailY + nailSize - nailAt; // scroll que tarda la tarjeta en sacar la chapa por arriba
  gsap.set(nail, { x: slotX, y: slotY, xPercent: -50, yPercent: -50, scale: slotScale, rotation: 0 });
  tl.fromTo(nail, { x: slotX, y: slotY, scale: slotScale, rotation: 0 }, { x: nailX, y: nailY - nailAt, scale: 1, rotation: 2 * 360 + tilt, duration: nailAt, ease: 'power2.inOut', ...noImmediate }, 0);
  // Clavada: desde aquí se queda en la tarjeta (fija en pantalla, así que sube 1:1 con el scroll) y se hunde con ella.
  tl.fromTo(nail, { y: nailY - nailAt }, { y: nailY - nailAt - cardExit, duration: cardExit, ...noImmediate }, nailAt);
  tl.fromTo(card, { y: 0 }, { y: 6, duration: 0.02 * V, ease: 'power2.out' }, nailAt);
  tl.to(card, { y: 0, duration: 0.05 * V, ease: 'back.out(3)' }, nailAt + 0.02 * V);
  tl.fromTo(nailCap, { y: 0 }, { y: 6, duration: 0.02 * V, ease: 'power2.out', ...noImmediate }, nailAt);
  tl.to(nailCap, { y: 0, duration: 0.05 * V, ease: 'back.out(3)' }, nailAt + 0.02 * V);

  // ---- A. Manifiesto: las letras se arman mientras A entra (0.5 V a 0.95 V): al llegar, en scroll = V, la tarjeta se lee entera ----
  const letters = queryAll('[data-manifesto-card] [data-char]');
  tl.fromTo(
    letters,
    { x: (i: number) => scatter(i, 200).x, y: (i: number) => scatter(i, 200).y, rotation: (i: number) => scatter(i, 200).rotation, autoAlpha: 0 },
    { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 0.2 * V, ease: 'power2.out', stagger: { amount: 0.25 * V } },
    0.5 * V,
  );

  // La mesa (después de V, al seguir bajando): la receta es UNA fila y sus estaciones caen con rebote (scrub) escalonadas 0 / 15 / 30 % de V,
  // desde que la fila entra por abajo; su texto se revela al aterrizar. Los "+" y el "=" aparecen con escala .6 → 1 después de la
  // estación que los precede; la nota de la panela se dibuja con su estación.
  const table = aTop;
  const recipeTop = table + query<HTMLElement>('.manifesto__recipe').offsetTop; // offsetParent = A
  const signs = queryAll<HTMLElement>('[data-sign]');
  const steps = queryAll<HTMLElement>('[data-step]');
  const stepStart = (index: number) => Math.max(recipeTop - 0.95 * V, 1.05 * V) + index * 0.08 * V; // nunca antes de que A llegue
  steps.forEach((step, index) => {
    const start = stepStart(index);
    tl.fromTo(step, { scale: 0.3, y: 30, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 0.24 * V, ease: 'back.out(1.7)' }, start);
    tl.fromTo(step.querySelector('[data-step-text]'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.1 * V, ease: 'power2.out' }, start + 0.12 * V);
    if (signs[index]) tl.fromTo(signs[index], { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.08 * V, ease: 'back.out(2)' }, start + 0.16 * V);
    const note = step.querySelector('[data-panela-note]');
    if (!note) return;
    tl.fromTo(note, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 * V }, start + 0.16 * V);
    tl.fromTo(note.querySelector('path'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.12 * V }, start + 0.2 * V);
  });

  // Parallax: desde que A se suelta (V) hasta que sale, el fondo (0.9) se queda atrás y el primer plano (1.2) sube más rápido.
  const aHeight = manifesto.offsetHeight;
  queryAll<HTMLElement>('[data-parallax]').forEach((layer) => {
    tl.fromTo(layer, { y: 0 }, { y: (1 - Number(layer.dataset.parallax)) * aHeight, duration: aHeight }, V);
  });

  // La botella espera acostada en la mesa (a la derecha, sin mover x) y se endereza (back.out) hacia el centro, rumbo al chorro, cuando aterriza la última estación.
  const spoutTop = documentTop(spout);
  const standAt = stepStart(steps.length - 1) + 0.3 * V;
  const standEnd = Math.max(standAt + 0.5 * V, spoutTop - 0.2 * V);
  // En A rueda acostada sobre la mesa (cuarto de vuelta, rotZ +90°) y se levanta al ponerse de pie.
  tl.fromTo(stage, { rotZ: leanRotation }, { rotZ: Math.PI / 2, duration: 0.5 * V, ease: 'power2.inOut', ...noImmediate }, V);
  tl.fromTo(stage, { rotZ: Math.PI / 2 }, { rotZ: 0, duration: standEnd - standAt, ease: 'back.out(1.6)', ...noImmediate }, standAt);
  tl.fromTo(stage, { x: tableX, y: tableY, height: heroHeight }, { x: betaX, y: centerY, height: centerHeight, duration: standEnd - standAt, ease: 'power2.inOut', ...noImmediate }, standAt);

  // Cuarto de luz: cada capítulo tiene su color; el cambio es un corte seco al cruzar el borde por el centro.
  const setChapter = (from: number, to: number, at: number) => tl.fromTo(stage, { chapter: from }, { chapter: to, duration: 0.001, ...noImmediate }, at);
  setChapter(2, 0, aTop - V / 2);
  setChapter(0, 1, spoutTop + spout.offsetHeight / 2 - V / 2);

  // ---- B. La más fría: la botella ya llega llena; aquí suda y caen los cubos de hielo ----
  const fillTop = documentTop(fill);
  // B fija solo 0.3 V (la sección mide 130svh): todo cabe en ese tramo.
  tl.fromTo(stage, { sweat: 0 }, { sweat: 1, duration: 0.25 * V, ...noImmediate }, fillTop + 0.05 * V);
  // 7 cubos y la chapa seguidos entre 0.02 y 0.29 V; los grandes golpean la botella (Impacto) al caer.
  queryAll<HTMLElement>('[data-ice]').forEach((cube, index) => {
    const start = fillTop + (0.02 + index * 0.02) * V;
    tl.fromTo(cube, { y: -V * 1.7, rotation: Number(cube.dataset.rotation) * 4, xPercent: -50, yPercent: -50 }, { y: 0, rotation: Number(cube.dataset.rotation), xPercent: -50, yPercent: -50, duration: 0.15 * V, ease: 'back.out(1.4)' }, start);
    if (cube.hasAttribute('data-big')) tl.call(bumpBottle, [], start + 0.1 * V);
  });
  tl.fromTo(query('[data-fill-note]'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.06 * V }, fillTop + 0.18 * V);
  tl.fromTo(query('[data-fill-note] path'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.08 * V }, fillTop + 0.2 * V);

  // ---- Entrada a C: la botella fija baja a 54svh y llega a su carril en la pista, a la izquierda de la pantalla ----
  const track = query<HTMLElement>('[data-flavors-track]');
  const handoffHeight = V * (mobile ? 0.42 : 0.54);
  const bottleX = vw * 0.32; // la botella queda fija en x; la pista pasa y ella sube y baja siguiendo las flechas
  const levelY = { bottom: V * 0.7, top: V * 0.3 };
  const entryStart = Math.min(Math.max(fillTop + 0.3 * V, pinTop - V), pinTop - 0.3 * V);
  tl.fromTo(stage, { x: betaX, y: centerY, height: centerHeight }, { x: bottleX, y: levelY.bottom, height: handoffHeight, duration: pinTop - entryStart, ease: 'none', ...noImmediate }, entryStart);
  tl.fromTo(stage, { rotZ: 0 }, { rotZ: TURN, duration: pinTop - entryStart, ease: 'power2.inOut', ...noImmediate }, entryStart); // vuelta completa al bajar a C
  setChapter(1, 2, flavorsTop - V / 2);

  // ---- C. Sabores en zigzag: la pista horizontal pasa y UNA botella recorre las flechas, cambiando de sabor en cada una ----
  const centers = queryAll<HTMLElement>('[data-flavor-word]').map((word) => word.getBoundingClientRect().left + word.offsetWidth / 2);
  const activeX = vw * 0.5; // la última palabra termina centrada
  const travel = Math.max(1, centers[centers.length - 1] - activeX);
  const length = 3 * V;
  tl.fromTo(track, { x: 0 }, { x: -travel, duration: length }, pinTop);
  const timeAt = (screenXAtStart: number, target: number) => pinTop + Math.max(0, ((screenXAtStart - target) / travel) * length);

  queryAll<HTMLElement>('[data-flavor-gap]').forEach((gap, index) => {
    const { left, width } = gap.getBoundingClientRect();
    const from = gap.classList.contains('flavors__gap--bottom') ? levelY.bottom : levelY.top;
    const to = from === levelY.bottom ? levelY.top : levelY.bottom;
    const arrow = arrowCurve(width, from, to);
    const path = gap.querySelector<SVGPathElement>('[data-arrow]')!;
    const head = gap.querySelector<SVGPathElement>('[data-arrow-head]')!;
    const svg = path.ownerSVGElement!;
    svg.setAttribute('viewBox', `0 0 ${width} ${V}`);
    path.setAttribute('d', arrow.curve);
    head.setAttribute('d', arrow.head);
    const pathLength = path.getTotalLength();
    const headLength = head.getTotalLength();

    // Flecha a mano: se dibuja desde que el hueco entra por la derecha hasta que su borde izquierdo llega a la botella; la punta cierra.
    const drawStart = timeAt(left, vw * 0.98);
    const crossStart = timeAt(left, bottleX); // la botella entra al hueco
    const drawEnd = Math.max(drawStart + 0.2 * V, crossStart);
    const drawBody = 0.9 * (drawEnd - drawStart);
    tl.fromTo(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength }, { strokeDashoffset: 0, duration: drawBody }, drawStart);
    tl.fromTo(head, { strokeDasharray: headLength, strokeDashoffset: headLength }, { strokeDashoffset: 0, duration: drawEnd - drawStart - drawBody }, drawStart + drawBody);

    // La botella cruza el hueco: su y sigue la curva y el sabor se funde del de esta palabra al de la siguiente.
    const crossLength = (width / travel) * length;
    tl.fromTo(stage, { y: from }, { y: to, duration: crossLength, ease: arrow.ease, ...noImmediate }, crossStart);
    const flavors = { flavorA: index, flavorB: index + 1 };
    tl.fromTo(stage, { ...flavors, mix: 0 }, { ...flavors, mix: 1, duration: 0.5 * crossLength, ease: 'power1.inOut', ...noImmediate }, crossStart + 0.25 * crossLength);
  });

  // Postales: van 1:1 con la pista y pasan de ±9° a ±5° (la inclinación final la pone el CSS) mientras cruzan la pantalla.
  // La chapa-estampilla rueda en 2D con la distancia: rotación = distancia / radio.
  queryAll<HTMLElement>('[data-postal]').forEach((postal) => {
    const sign = Number(postal.dataset.sign);
    const { left, width } = postal.getBoundingClientRect();
    const start = timeAt(left, vw);
    const crossing = ((vw + width) / travel) * length;
    tl.fromTo(postal, { rotation: 4 * sign }, { rotation: 0, duration: crossing }, start);
    const stamp = postal.querySelector<HTMLElement>('[data-stamp]')!;
    const radius = stamp.getBoundingClientRect().width / 2;
    tl.fromTo(stamp, { rotation: 0 }, { rotation: -((vw + width) / radius) * (180 / Math.PI), duration: crossing }, start);
  });

  // ---- C -> D: la hoja mora sube 1:1 con el scroll, pegada al borde de D (que sube con ella), y aterriza en `land` ----
  const land = orderTop; // D llega arriba (margin-top -100svh de .order: = sliceTop + sliceLength)
  const sliceLength = land - sliceTop;
  const sheet = query<HTMLElement>('[data-sheet]');
  const tearHeight = sheet.querySelector<HTMLElement>('.tear')!.offsetHeight;
  tl.fromTo(sheet, { y: V + tearHeight }, { y: 0, duration: V + tearHeight, ease: 'none' }, land - V - tearHeight);
  // La MISMA botella pasa de su carril en C al hueco de D y cambia al sabor elegido en D a mitad del camino; aterriza con la hoja.
  // En móvil D apila el hueco de la botella sobre la tarjeta: la botella aterriza en el hueco para no taparla.
  const orderSlot = query<HTMLElement>('.order__bottle');
  const dX = mobile ? vw / 2 : vw * 0.26;
  const dY = mobile ? orderSlot.offsetTop + orderSlot.offsetHeight / 2 : V * 0.5;
  const dHeight = mobile ? orderSlot.offsetHeight : centerHeight;
  tl.fromTo(stage, { x: bottleX, y: levelY.bottom, height: handoffHeight }, { x: dX, y: dY, height: dHeight, duration: sliceLength, ease: 'power2.inOut', ...noImmediate }, sliceTop);
  tl.fromTo(stage, { rotZ: TURN }, { rotZ: 2 * TURN, duration: sliceLength, ease: 'power2.inOut', ...noImmediate }, sliceTop); // y otra al volar a D
  // En el aire desde que sale de B hasta que aterriza en D (impacto con aplastado).
  tl.fromTo(stage, { floating: 0 }, { floating: 1, duration: 0.1 * V, ...noImmediate }, entryStart + 0.2 * V);
  tl.fromTo(stage, { floating: 1 }, { floating: 0, duration: 0.05 * V, ...noImmediate }, land - 0.05 * V);
  tl.call(() => bumpBottle(true), [], land);
  tl.fromTo(stage, { orderZone: 0 }, { orderZone: 1, duration: 0.4 * sliceLength, ease: 'none', ...noImmediate }, sliceTop + 0.3 * sliceLength);
  setChapter(2, 0, land - 0.3 * V);
  tl.fromTo(stage, { follow: 0 }, { follow: 1, duration: mobile ? 0.1 * V : V, ease: 'power1.inOut', ...noImmediate }, land); // en móvil el hueco sube pegado a la tarjeta: la botella lo alcanza rápido para no tapar el titular // no antes de que la botella aterrice

  // ---- D. El contenido se arma MIENTRAS D sube (su tarjeta entra por abajo con la hoja) y queda completo al aterrizar ----
  const reveal = land - 0.4 * V;
  const orderLetters = queryAll('[data-order-title] [data-char]');
  tl.fromTo(
    orderLetters,
    { x: (i: number) => scatter(i, 140).x, y: (i: number) => scatter(i, 140).y, rotation: (i: number) => scatter(i, 140).rotation, autoAlpha: 0 },
    { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 0.1 * V, ease: 'power2.out', stagger: { amount: 0.1 * V } },
    reveal + 0.04 * V,
  );
  tl.fromTo(card2, { y: 0.15 * V, rotation: 2 }, { y: 0, rotation: 0, duration: 0.25 * V, ease: 'back.out(1.3)' }, reveal);
  tl.fromTo('[data-order-card] .pill', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.06 * V }, reveal + 0.02 * V);
  tl.fromTo('.order__lead', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.07 * V }, reveal + 0.08 * V);
  queryAll('[data-order-flavor]').forEach((row, index) => {
    tl.fromTo(row, { scale: 0.3, y: 40, rotation: -40, autoAlpha: 0 }, { scale: 1, y: 0, rotation: 0, autoAlpha: 1, duration: 0.08 * V, ease: 'back.out(2)' }, reveal + (0.12 + index * 0.03) * V);
  });
  tl.fromTo('.order__cart', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.07 * V }, reveal + 0.2 * V);
  tl.fromTo('.order__submit', { scale: 0.85 }, { scale: 1, duration: 0.08 * V, ease: 'back.out(2.5)' }, reveal + 0.24 * V);

  // ---- Paso horizontal: scroll horizontal puro, el hero sale por la izquierda y A entra por la derecha, 1:1 con el scroll ----
  // Al final, con las medidas ya tomadas: estos tweens mueven el layout (x) y las lecturas de arriba no deben verlo.
  // x en píxeles enteros en los dos: con x fraccionario quedaba una rendija de 1px entre hero y A.
  const wholePx = { x: (value: string) => `${Math.round(parseFloat(value))}px` };
  tl.fromTo(hero, { x: 0 }, { x: -vw, duration: V, modifiers: wholePx }, 0);
  tl.fromTo(manifesto, { x: vw }, { x: 0, duration: V, modifiers: wholePx }, 0);

  return tl;
}
