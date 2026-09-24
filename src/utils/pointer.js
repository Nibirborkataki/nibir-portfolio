// A real mouse/trackpad (can hover, precise). Phones and tablets don't match this, whatever
// their width – cursor effects and scroll-hijacking are only used when it matches.
export const FINE_POINTER = '(hover: hover) and (pointer: fine)';
export const COARSE_POINTER = 'not all and (hover: hover) and (pointer: fine)';

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia(FINE_POINTER).matches;
