import { gsap } from 'gsap';
import { stage } from './bottle';

const query = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;

/** Posición de la botella en el hero (scroll 0). Liviano: no arma el timeline. */
export function syncHeroStage() {
  const V = query<HTMLElement>('.hero').offsetHeight;
  const vw = document.documentElement.clientWidth;
  const mobile = vw < 768;
  const tablet = !mobile && vw < 1100;
  const heroHeight = V * (mobile ? 0.4 : tablet ? 0.46 : 0.66);
  const crestY = V * 0.84;
  const heroX = vw * (mobile ? 0.74 : tablet ? 0.86 : 0.84);
  const cantoDrop = (heroX - vw * 0.84) * -Math.tan((4 * Math.PI) / 180);
  const heroY = crestY + cantoDrop - heroHeight * 0.48;
  gsap.set(stage, { x: heroX, y: heroY, height: heroHeight, rotZ: 0, fill: 1, sweat: 0, chapter: 2, flavorA: 0, flavorB: 0, mix: 0, follow: 0, orderZone: 0, floating: 0 });
}