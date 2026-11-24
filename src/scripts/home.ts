import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { startSmoothScroll } from './smooth-scroll';
import { startNavbarTone } from './navbar-tone';
import { startBottle } from './bottle';
import { startOrder } from './order';
import { startNotes } from './notes';
import { startSpout } from './spout';
import { startStory, syncHeroStage } from './story';
import { startReducedBottle } from './reduced';
import { startIntro } from './intro';
import { prefersReducedMotion } from './motion';
import { trackSections } from './analytics';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const reduced = prefersReducedMotion();
const spout = startSpout();
let story: ReturnType<typeof startStory> | undefined;
let scrollReady = false;

trackSections();
startBottle();
startNavbarTone();

if (reduced) startReducedBottle();
else syncHeroStage();

const layoutPage = () => {
  spout.layout();
  if (!reduced) {
    story ??= startStory(spout.setScroll);
    story.build();
    if (!scrollReady) {
      startSmoothScroll();
      scrollReady = true;
    }
  }
  ScrollTrigger.refresh();
};

void startIntro(layoutPage);

const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200));
idle(() => {
  startOrder();
  startNotes();
});

let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;
let resizeTimer: number | undefined;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (window.innerWidth === lastWidth && Math.abs(window.innerHeight - lastHeight) <= 120) return;
    lastWidth = window.innerWidth;
    lastHeight = window.innerHeight;
    if (!reduced) syncHeroStage();
    layoutPage();
  }, 200);
});