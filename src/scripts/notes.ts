// Las flechas de las notas se dibujan una sola vez, la primera vez que la nota entra en pantalla.
export function startNotes() {
  const notes = document.querySelectorAll<HTMLElement>('[data-note]');
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-drawn');
        observer.unobserve(entry.target);
      }),
    { threshold: 0.6 },
  );
  notes.forEach((note) => observer.observe(note));
}
