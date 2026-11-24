import { gsap } from 'gsap';
import { DEFAULT_ORDER_FLAVOR } from '../../data/flavors';
import { prefersReducedMotion } from '../motion';
import { createBottleSequence, type SequencePose } from './sequence';

// Lo que se dibuja: la botella gouache 2D. `fill` y `sweat` ya vienen pintados en la imagen.
interface BottleState extends SequencePose {
  fill: number;
  sweat: number;
}

type Pose = Pick<BottleState, 'x' | 'y' | 'height' | 'rotZ' | 'fill' | 'sweat' | 'chapter' | 'floating'>;

const emptyPose = (): Pose => ({ x: 0, y: 0, height: 0, rotZ: 0, fill: 0, sweat: 0, chapter: 0, floating: 0 });

// Lo que se dibuja (lo calcula tick a partir de las tres fuentes de abajo).
const bottleState: BottleState = { ...emptyPose(), flavorA: 0, flavorB: 0, mix: 0, squash: 0 };

// 1) Loader: la botella gira sola en el centro, sin scroll.
export const intro = { ...emptyPose(), active: true };

// 2) Recorrido: lo anima story.ts con un timeline que avanza con el scroll. `follow` mezcla hacia el hueco de D.
// `orderZone` (0 a 1) funde la botella del sabor de C al sabor de D mientras viaja de una a otra.
// `floating` (0 a 1): en el aire (pista de C y viaje a D), con la sombra sólida desplazada en vez de la elipse de piso.
export const stage = { ...emptyPose(), flavorA: 0, flavorB: 0, mix: 0, follow: 0, orderZone: 0 };

// 3) Sabor de D (chapas y +): es la verdad en D y se conserva al subir y volver a bajar.
const pick = { flavorA: DEFAULT_ORDER_FLAVOR, flavorB: DEFAULT_ORDER_FLAVOR, mix: 0 };

// Hueco donde se monta la botella cuando follow > 0 (D) o en movimiento reducido (cada sección tiene el suyo).
let slotProvider: () => HTMLElement | null = () => document.querySelector<HTMLElement>('[data-bottle-slot]');
export const setSlotProvider = (provider: () => HTMLElement | null) => {
  slotProvider = provider;
};

const currentFlavor = (flavorA: number, flavorB: number, mix: number) => (mix >= 0.5 ? flavorB : flavorA);

export function showFlavor(index: number) {
  const current = currentFlavor(pick.flavorA, pick.flavorB, pick.mix);
  if (index === current) return;

  gsap.killTweensOf(pick);
  Object.assign(pick, { flavorA: current, flavorB: index, mix: 0 });
  const settle = () => Object.assign(pick, { flavorA: index, mix: 0 });
  if (prefersReducedMotion()) return settle();

  gsap.to(pick, { mix: 1, duration: 0.3, ease: 'power1.inOut', onComplete: settle });
  bumpBottle();
}

export const setBottleVisible = (visible: boolean, seconds: number) => {
  const layers = document.querySelectorAll<HTMLElement>('[data-bottle-stack]');
  if (layers.length) gsap.to(layers, { autoAlpha: visible ? 1 : 0, duration: seconds });
};

// Impacto: algo la tocó (cambia de sabor, cae hielo, aterriza). Rotación con pivote en la base: -5° → 4° → -2° → 0°.
// Al aterrizar, además, se aplasta (scaleY .93 / scaleX 1.05 → 1, 260 ms back.out(2)).
const impact = { angle: 0, squash: 0 };
const degrees = (value: number) => (value * Math.PI) / 180;
export function bumpBottle(landing = false) {
  if (prefersReducedMotion()) return;
  gsap.killTweensOf(impact);
  const timeline = gsap.timeline();
  [-5, 4, -2, 0].forEach((angle) => timeline.to(impact, { angle: degrees(angle), duration: 0.15, ease: 'power2.out' }));
  if (landing) gsap.fromTo(impact, { squash: 1 }, { squash: 0, duration: 0.26, ease: 'back.out(2)' });
}

// Está viva todo el recorrido: balanceo de ±2° cuando está quieta (3,2 s) e inclinación con la velocidad del scroll (tope ±12°).
let lastScrollY = 0;
let velocity = 0;
let clock = 0;

function composeAlive(deltaSeconds: number) {
  const y = window.scrollY;
  if (prefersReducedMotion()) return;
  bottleState.squash = impact.squash;
  if (intro.active) return void (bottleState.rotZ += impact.angle); // cayendo a la cresta: solo el impacto
  velocity += ((y - lastScrollY) / Math.max(deltaSeconds, 0.001) - velocity) * 0.15;
  lastScrollY = y;
  clock += deltaSeconds;
  const lean = Math.max(-degrees(12), Math.min(degrees(12), velocity * 0.00006));
  bottleState.rotZ += Math.sin((clock / 3.2) * Math.PI * 2) * degrees(2) + lean + impact.angle;
}

function composeState() {
  const pose: Pose = intro.active ? intro : stage;
  Object.assign(bottleState, pose);
  bottleState.chapter = Math.round(pose.chapter);

  const slot = intro.active ? null : slotProvider();
  const inOrder = slot?.matches('[data-bottle-slot]') ?? false;
  // En D (y en el hueco de D en movimiento reducido) manda el sabor elegido.
  const inChoice = stage.orderZone >= 1 || (inOrder && stage.follow >= 1);
  const flavors = inChoice ? pick : stage;
  Object.assign(bottleState, { flavorA: flavors.flavorA, flavorB: flavors.flavorB, mix: flavors.mix });
  if (!inChoice && stage.orderZone > 0) {
    // Entre C y D: el sabor de C (debajo) y el elegido en D (encima, con `mix` = progreso).
    Object.assign(bottleState, { flavorA: currentFlavor(stage.flavorA, stage.flavorB, stage.mix), flavorB: currentFlavor(pick.flavorA, pick.flavorB, pick.mix), mix: stage.orderZone });
  }

  if (!slot || stage.follow <= 0) return;
  const { left, top, width, height } = slot.getBoundingClientRect();
  const t = stage.follow;
  bottleState.x += (left + width / 2 - bottleState.x) * t;
  bottleState.y += (top + height / 2 - bottleState.y) * t;
  bottleState.height += (height - bottleState.height) * t;
  if (t < 1) return;

  // Con follow completo cada hueco trae su pose (data-chapter, data-fill, data-sweat y, en C, data-flavor).
  const { chapter, fill, sweat, flavor } = slot.dataset;
  if (chapter !== undefined) Object.assign(bottleState, { chapter: Number(chapter), fill: Number(fill), sweat: Number(sweat), rotZ: 0 });
  if (flavor !== undefined) Object.assign(bottleState, { flavorA: Number(flavor), flavorB: Number(flavor), mix: 0 });
}

export function startBottle() {
  const stack = document.querySelector<HTMLElement>('[data-bottle-stack]');
  if (!stack) return false;

  const sequence = createBottleSequence(stack);
  gsap.ticker.add((_time, deltaTime) => {
    composeState();
    composeAlive(deltaTime / 1000);
    sequence.render(bottleState);
  });
  return true;
}
