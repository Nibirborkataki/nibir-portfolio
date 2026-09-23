// Tiny signal so page sections can hold their intro animations
// until the loading screen has revealed the site.
let ready = false;
const EVENT = 'app:ready';

export function markAppReady() {
  if (ready) return;
  ready = true;
  window.dispatchEvent(new Event(EVENT));
}

export function onAppReady(callback) {
  if (ready) {
    callback();
    return () => {};
  }
  window.addEventListener(EVENT, callback, { once: true });
  return () => window.removeEventListener(EVENT, callback);
}
