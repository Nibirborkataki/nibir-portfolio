// Shares the app's Lenis instance so components can drive the page scroll.
let instance = null;

export function setLenis(lenis) {
  instance = lenis;
}

export function getLenis() {
  return instance;
}
