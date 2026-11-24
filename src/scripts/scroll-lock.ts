type ScrollEngine = { stop(): void; start(): void };

let engine: ScrollEngine | undefined;
let locked = false;

// Lenis arranca durante la intro: hereda el bloqueo que ya esté puesto.
export function bindScrollEngine(scroll: ScrollEngine) {
  engine = scroll;
  if (locked) scroll.stop();
}

export function setScrollLocked(value: boolean) {
  locked = value;
  engine?.[value ? 'stop' : 'start']();
}