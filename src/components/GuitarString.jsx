import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const WIDTH = 160;
const HEIGHT = 48;
const MID = HEIGHT / 2;
const MAX_BEND = 16;

/**
 * A horizontal line that behaves like a guitar string: it bends toward the cursor while
 * hovered and, when released, vibrates back to rest with a damped wobble.
 */
export default function GuitarString({ className = '' }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    const bend = { x: WIDTH / 2, y: 0 };
    const draw = () => {
      // Quadratic curve: the control point is pulled by twice the visible bend.
      path.setAttribute('d', `M0 ${MID} Q ${bend.x} ${MID + bend.y * 2} ${WIDTH} ${MID}`);
    };
    draw();

    const local = (e) => {
      const box = wrap.getBoundingClientRect();
      return [
        gsap.utils.clamp(0, WIDTH, ((e.clientX - box.left) / box.width) * WIDTH),
        gsap.utils.clamp(-MAX_BEND, MAX_BEND, ((e.clientY - box.top) / box.height) * HEIGHT - MID),
      ];
    };

    const onMove = (e) => {
      const [x, y] = local(e);
      gsap.to(bend, { x, y, duration: 0.18, ease: 'power2.out', overwrite: true, onUpdate: draw });
      gsap.to(path, { attr: { stroke: '#6b7280' }, duration: 0.2, overwrite: 'auto' });
    };

    const release = () => {
      // Pluck: snap through the rest position and ring out.
      gsap.to(bend, { y: 0, duration: 2.4, ease: 'elastic.out(1.1, 0.06)', overwrite: true, onUpdate: draw });
      gsap.to(path, { attr: { stroke: '#d1d5db' }, duration: 1.2, delay: 0.3, overwrite: 'auto' });
    };

    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', release);
    return () => {
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', release);
      gsap.killTweensOf([bend, path]);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`cursor-pointer ${className}`} style={{ width: WIDTH, height: HEIGHT }} aria-hidden="true">
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="overflow-visible">
        <path ref={pathRef} d={`M0 ${MID} L${WIDTH} ${MID}`} fill="none" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
