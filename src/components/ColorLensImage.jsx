import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { hasFinePointer } from '../utils/pointer';

const LENS_RADIUS = 78;
const START_RADIUS = 16; // the site cursor is a 32px ball – the lens grows out of it
const RING_COUNT = 3;
// The photo itself is black & white, so the lens colour-grades it into warm, natural tones.
const COLOR_GRADE = 'sepia(0.55) saturate(2.4) hue-rotate(-10deg) contrast(1.06) brightness(1.04)';

/**
 * An image that shows a colour "water drop" lens under the cursor: on hover the lens
 * splashes open with ripples, follows the pointer, and magnifies slightly like water.
 * Mouse only – touch devices just see the photo.
 */
export default function ColorLensImage({ src, alt, className = '', imgClassName = '' }) {
  const wrapRef = useRef(null);
  const colorRef = useRef(null);
  const rimRef = useRef(null);
  const ringsRef = useRef(null);
  // Phones/tablets get the plain photo – no lens, rim or ripples at all.
  const [lensEnabled] = useState(hasFinePointer);

  useEffect(() => {
    if (!lensEnabled) return undefined;
    const wrap = wrapRef.current;
    const color = colorRef.current;
    const rim = rimRef.current;
    const rings = Array.from(ringsRef.current.children);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lens = { x: 0, y: 0, r: 0 };
    const draw = () => {
      color.style.clipPath = `circle(${lens.r}px at ${lens.x}px ${lens.y}px)`;
      color.style.transformOrigin = `${lens.x}px ${lens.y}px`;
      rim.style.width = rim.style.height = `${lens.r * 2}px`;
      rim.style.transform = `translate(${lens.x - lens.r}px, ${lens.y - lens.r}px)`;
      rim.style.opacity = lens.r > 1 ? '1' : '0';
    };
    const xTo = gsap.quickTo(lens, 'x', { duration: 0.3, ease: 'power3.out', onUpdate: draw });
    const yTo = gsap.quickTo(lens, 'y', { duration: 0.3, ease: 'power3.out', onUpdate: draw });

    const local = (e) => {
      const box = wrap.getBoundingClientRect();
      return [e.clientX - box.left, e.clientY - box.top];
    };

    const splash = (x, y, strength = 1) => {
      if (reduceMotion) {
        gsap.to(lens, { r: LENS_RADIUS, duration: 0.2, onUpdate: draw });
        return;
      }
      // Grow out of the cursor with a springy overshoot, like a drop hitting water.
      gsap.fromTo(
        lens,
        { r: Math.max(lens.r * 0.7, START_RADIUS) },
        { r: LENS_RADIUS, duration: 1.1, ease: 'elastic.out(1, 0.42)', onUpdate: draw, overwrite: 'auto' }
      );
      gsap.fromTo(color, { scale: 1.16 }, { scale: 1.06, duration: 1.1, ease: 'elastic.out(1, 0.42)', overwrite: 'auto' });
      rings.forEach((ring, i) => {
        gsap.set(ring, { x, y, xPercent: -50, yPercent: -50 });
        gsap.fromTo(
          ring,
          { scale: 0.2, opacity: 0.5 * strength },
          { scale: 1 + i * 0.3, opacity: 0, duration: 0.9 + i * 0.18, delay: i * 0.09, ease: 'power2.out', overwrite: 'auto' }
        );
      });
    };

    const close = () => gsap.to(lens, { r: 0, duration: 0.4, ease: 'power3.in', onUpdate: draw, overwrite: 'auto' });

    const place = (e) => {
      const [x, y] = local(e);
      gsap.set(lens, { x, y });
      draw();
      return [x, y];
    };

    const onEnter = (e) => {
      if (e.pointerType !== 'mouse') return;
      splash(...place(e));
    };
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const [x, y] = local(e);
      xTo(x);
      yTo(y);
    };
    const onLeave = (e) => {
      if (e.pointerType === 'mouse') close();
    };
    // Mouse only – on touch screens the photo stays as it is.
    const onDown = (e) => {
      if (e.pointerType === 'mouse') splash(...local(e), 0.7); // click: a smaller second splash
    };

    wrap.addEventListener('pointerenter', onEnter);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    wrap.addEventListener('pointerdown', onDown);
    return () => {
      wrap.removeEventListener('pointerenter', onEnter);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('pointerdown', onDown);
      gsap.killTweensOf([lens, color, ...rings]);
    };
  }, [lensEnabled]);

  const ringSize = LENS_RADIUS * 2 * 1.5;

  if (!lensEnabled) {
    return (
      <div className={`relative ${className}`}>
        <img src={src} alt={alt} className={`w-full h-full object-cover ${imgClassName}`} draggable="false" />
      </div>
    );
  }

  return (
    // data-cursor="lens" tells CustomCursor to hide its ball here – the lens takes over.
    <div ref={wrapRef} data-cursor="lens" className={`relative ${className}`}>
      <img src={src} alt={alt} className={`w-full h-full object-cover ${imgClassName}`} draggable="false" />
      <img
        ref={colorRef}
        src={src}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ filter: COLOR_GRADE, clipPath: 'circle(0px at 0px 0px)', willChange: 'clip-path, transform' }}
      />
      {/* Water-drop rim: soft highlight on top, shadow underneath */}
      <div
        ref={rimRef}
        aria-hidden="true"
        className="absolute top-0 left-0 rounded-full pointer-events-none"
        style={{
          opacity: 0,
          border: '1px solid rgba(255,255,255,0.55)',
          background: 'radial-gradient(circle at 32% 26%, rgba(255,255,255,0.4), rgba(255,255,255,0) 38%)',
          boxShadow:
            'inset 0 0 18px rgba(255,255,255,0.35), inset 0 -8px 16px rgba(0,0,0,0.12), 0 12px 30px rgba(0,0,0,0.18)',
        }}
      />
      {/* Ripples */}
      <div ref={ringsRef} aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {Array.from({ length: RING_COUNT }, (_, i) => (
          <span
            key={i}
            className="absolute top-0 left-0 rounded-full"
            style={{ width: ringSize, height: ringSize, border: '1.5px solid rgba(17,17,17,0.35)', opacity: 0 }}
          />
        ))}
      </div>
    </div>
  );
}
