import { FLAVORS } from '../../data/flavors';
import images from '../../data/bottleImages.json';

// La botella son tres imágenes 2D de frente (una por sabor, gouache). Posición, escala, inclinación y balanceo son CSS transform.
// Cambio de sabor = fundido entre imágenes. Las exporta fuentes/exportar_botellas.mjs (sin variante destapada: el footer ya no hace el destape).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const CHAPTER_GROUND = ['--mora', '--mandarina', '--maracuya']; // fondo de cada capítulo, para teñir la sombra de contacto

type FrameSet = keyof typeof images.frame;
const pickSet = (): FrameSet => (window.matchMedia('(max-width: 767px)').matches ? 'm' : window.devicePixelRatio >= 1.5 ? '2x' : '1x');
const imageUrl = (set: FrameSet, name: string) => `${BASE}/bottle/${set}/${name}.webp`;

export interface SequencePose {
  x: number;
  y: number;
  height: number; // px de pantalla (0 = escondida)
  rotZ: number;
  flavorA: number;
  flavorB: number;
  mix: number;
  chapter: number; // fondo del capítulo: mora, mandarina o maracuyá
  floating: number; // 1 = en el aire: sombra sólida desplazada (tipo tarjeta) en vez de la elipse de piso
  squash: number; // 0 a 1: aplastado al aterrizar (pivote en la base)
}

class FlavorImage {
  readonly element = new Image();
  private readonly cappedUrl: string;
  private started = false;

  constructor(
    id: string,
    set: FrameSet,
  ) {
    const [width, height] = images.frame[set];
    this.cappedUrl = imageUrl(set, id);
    this.element.width = width;
    this.element.height = height;
    this.element.alt = '';
    this.element.decoding = 'async';
    this.element.className = 'bottle-stack__frame';
    this.element.style.opacity = '0';
  }

  // Mora y lulo bajan en reposo (o antes, si el scroll las pide).
  load() {
    if (this.started) return;
    this.started = true;
    this.element.src = this.cappedUrl;
    void this.element.decode().catch(() => undefined);
  }
}

export function createBottleSequence(stack: HTMLElement) {
  const set = pickSet();
  const [frameWidth, frameHeight] = images.frame[set];
  // Sombra de contacto apoyada: elipse plana sin desenfoque, del color del fondo oscurecido, sigue x y escala pero no se inclina.
  const shadow = document.createElement('div');
  shadow.className = 'bottle-stack__shadow';
  stack.append(shadow);
  const flavors = FLAVORS.map(({ id }) => new FlavorImage(id, set));
  flavors.forEach((flavor) => stack.append(flavor.element));
  flavors[0]!.load();
  const whenIdle = window.requestIdleCallback ?? ((callback: () => void) => setTimeout(callback, 2500));
  whenIdle(() => flavors.forEach((flavor) => flavor.load()));
  const lastTransform: string[] = [];
  const lastOpacity: number[] = [];
  let lastChapter = -1;
  let lastFloatShadow = '';

  function render(pose: SequencePose) {
    stack.hidden = pose.height <= 0;
    if (stack.hidden) return;
    const width = (pose.height * frameWidth) / frameHeight;
    // La sombra sigue la pose (|sin rotZ|): de pie, elipse angosta bajo la base; acostada, larga y delgada bajo todo el cuerpo y más tenue.
    const lying = Math.min(1, Math.abs(Math.sin(pose.rotZ)));
    const lerp = (standing: number, flat: number) => standing + (flat - standing) * lying;
    shadow.style.transform = `translate(${(pose.x + width * 0.08 * (1 - lying)).toFixed(1)}px, ${(pose.y + pose.height / 2).toFixed(1)}px) translate(-50%, -50%)`;
    shadow.style.width = `${lerp(width * 0.9, pose.height * 0.95).toFixed(1)}px`;
    shadow.style.height = `${lerp(pose.height * 0.06, width * 0.16).toFixed(1)}px`;
    shadow.style.opacity = String((1 - lerp(0, 0.4)) * (pose.floating > 0.02 ? 0 : 1));
    // En el aire, la sombra sólida de las tarjetas: se pinta sobre toda la pila para que el fundido de sabor no la duplique.
    const ground = `color-mix(in oklab, var(${CHAPTER_GROUND[pose.chapter] ?? '--maracuya'}) 78%, #000)`;
    const floatShadow = pose.floating > 0.02 ? `drop-shadow(14px 18px 0 color-mix(in oklab, ${ground} ${Math.round(pose.floating * 20) * 5}%, transparent))` : '';
    if (floatShadow !== lastFloatShadow) stack.style.filter = lastFloatShadow = floatShadow;
    if (pose.chapter !== lastChapter) shadow.style.background = `color-mix(in oklab, var(${CHAPTER_GROUND[(lastChapter = pose.chapter)] ?? '--maracuya'}) 78%, #000)`;
    const scale = pose.height / frameHeight;
    // La inclinación y el balanceo giran sobre la base de la botella (pivote abajo), no sobre el centro.
    // Con giros grandes (vueltas o acostada) el pivote pasa de la base al centro; acostada, la botella se apoya en el piso (baja la mitad de lo que le sobra de alto).
    const half = pose.height / 2;
    const turn = Math.abs(((((pose.rotZ + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI);
    const pivot = Math.min(1, Math.max(0, 1 - (turn - 0.35) / 0.5));
    const rest = (half - width / 2) * (1 - pivot) * Math.abs(Math.sin(turn));
    const transform = `translate(${pose.x.toFixed(1)}px, ${(pose.y + rest).toFixed(1)}px) translate(0, ${(half * pivot).toFixed(1)}px) rotate(${(-pose.rotZ).toFixed(4)}rad) scale(${(1 + 0.05 * pose.squash).toFixed(3)}, ${(1 - 0.07 * pose.squash).toFixed(3)}) translate(0, -${(half * pivot).toFixed(1)}px) scale(${scale.toFixed(4)}) translate(-50%, -50%)`;
    flavors.forEach((flavor, index) => {
      // A queda debajo; B entra encima con `mix`. A se apaga en el último tramo del fundido (no de golpe al terminar): sin esto el borde suave de B deja ver a A hasta el final y salta.
      const incoming = index === pose.flavorB && pose.flavorA !== pose.flavorB;
      const outgoing = index === pose.flavorA && pose.flavorA !== pose.flavorB;
      const opacity = incoming ? pose.mix : outgoing ? Math.min(1, (1 - pose.mix) / 0.15) : index === pose.flavorA || index === pose.flavorB ? 1 : 0;
      if (opacity > 0) flavor.load();
      if (lastOpacity[index] !== opacity) flavor.element.style.opacity = String((lastOpacity[index] = opacity));
      if (lastTransform[index] !== transform) flavor.element.style.transform = lastTransform[index] = transform;
      flavor.element.style.zIndex = index === pose.flavorB ? '1' : '0';
    });
  }
  return { render };
}
