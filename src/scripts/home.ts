import { gsap } from 'gsap';
import { startBottle } from './bottle';
import { startSpout } from './spout';
import { startReducedBottle } from './reduced';
import { startIntro } from './intro';
import { prefersReducedMotion } from './motion';
import { trackSections } from './analytics';
import { syncHeroStage } from './hero-stage';

const reduced = prefersReducedMotion();
const spout = startSpout();
let story: { build: () => void } | undefined;
let storyReady: Promise<void> | undefined;
let scrollReady = false;

trackSections();
startBottle();

if (reduced) startReducedBottle();
else syncHeroStage();

function ensureStory() {
  if (story) return Promise.resolve();
  storyReady ??= import('./story').then(({ startStory }) => {
    story = startStory(spout.setScroll);
  });
  return storyReady;
}

async function scrollTrigger() {
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  return ScrollTrigger;
}

const layoutPage = () =>
  (async () => {
    spout.layout();
    const ScrollTrigger = await scrollTrigger();
    if (!reduced) {
      await ensureStory();
      story!.build();
      document.documentElement.setAttribute('data-story', '');
      if (!scrollReady) {
        const [{ startSmoothScroll }, { startNavbarTone }] = await Promise.all([import('./smooth-scroll'), import('./navbar-tone')]);
        startSmoothScroll();
        startNavbarTone();
        scrollReady = true;
      }
    } else if (!scrollReady) {
      const { startNavbarTone } = await import('./navbar-tone');
      startNavbarTone();
      scrollReady = true;
    }
    ScrollTrigger.refresh();
  })();

void startIntro(layoutPage);

const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200));
idle(() => {
  if (!reduced) void import('./story'); // solo descarga: al terminar la intro el recorrido se arma sin esperar la red
  void import('./order').then(({ startOrder }) => startOrder());
  void import('./notes').then(({ startNotes }) => startNotes());
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
    layoutPage();
  }, 200);
});