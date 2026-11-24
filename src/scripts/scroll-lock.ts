type ScrollEngine = { stop(): void; start(): void };

let engine: ScrollEngine | undefined;

export function bindScrollEngine(scroll: ScrollEngine) {
  engine = scroll;
}

export function setScrollLocked(locked: boolean) {
  engine?.[locked ? 'stop' : 'start']();
}