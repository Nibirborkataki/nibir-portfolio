// Tiny signal so page sections can hold their intro animations
// until the loading screen has revealed the site.
let ready = false;
const EVENT = 'app:ready';

export function markAppReady() {
  if (ready) return;
  ready = true;
  // Dispatch on a fresh task: this is usually called from a GSAP callback, and anything
  // listeners create there would be adopted by (and reverted with) the caller's gsap.context.
  setTimeout(() => window.dispatchEvent(new Event(EVENT)), 0);
}

export function onAppReady(callback) {
  if (ready) {
    callback();
    return () => {};
  }
  window.addEventListener(EVENT, callback, { once: true });
  return () => window.removeEventListener(EVENT, callback);
}
