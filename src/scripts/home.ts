import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { startSmoothScroll } from './smooth-scroll';
import { startNavbarTone } from './navbar-tone';
import { startBottle } from './bottle';
import { startOrder } from './order';
import { startNotes } from './notes';
import { startSpout } from './spout';
import { startStory } from './story';
import { startReducedBottle } from './reduced';
import { startIntro } from './intro';
import { prefersReducedMotion } from './motion';
import { trackSections } from './analytics';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true }); // la barra de direcciones de iOS no debe recalcular todo

const reduced = prefersReducedMotion();

trackSections();
startSmoothScroll();
startBottle();
startNavbarTone();
startOrder();
startNotes();

const spout = startSpout();
const story = reduced ? undefined : startStory(spout.setScroll);
if (reduced) startReducedBottle();

const layoutPage = () => {
  spout.layout();
  story?.build();
  ScrollTrigger.refresh();
};

// La intro arma el layout (con fuentes y frutas ya cargadas) justo antes de arrancar.
void startIntro(layoutPage);

// El timeline mide el layout: se reconstruye al cambiar el ancho (o el alto en más de 120 px: en iOS la barra de direcciones lo mueve).
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;
let resizeTimer: number | undefined;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (window.innerWidth === lastWidth && Math.abs(window.innerHeight - lastHeight) <= 120) return;
    lastWidth = window.innerWidth;
    lastHeight = window.innerHeight;
    layoutPage();
  }, 200);
});
