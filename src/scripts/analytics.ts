// Eventos de GoatCounter (pageviews los cuenta el script en BaseLayout).
// Sin cookies; en dev el script no se carga. Clics: data-goatcounter-click en el HTML.

type GoatCounter = { count?: (vars: { path: string; title?: string; event: boolean }) => void };

export function track(name: string) {
  const send = () => (window as Window & { goatcounter?: GoatCounter }).goatcounter?.count?.({ path: name, title: name, event: true });
  if ((window as Window & { goatcounter?: GoatCounter }).goatcounter?.count || document.readyState === 'complete') send();
  else window.addEventListener('load', send, { once: true });
}

// Una vez por visita cuando cada sección entra al viewport (scroll-*).
export function trackSections() {
  const seen = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = (entry.target as HTMLElement).dataset.analyticsSection;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        track(`scroll-${id}`);
      }
    },
    { threshold: 0.35 },
  );
  for (const node of document.querySelectorAll('[data-analytics-section]')) observer.observe(node);
}