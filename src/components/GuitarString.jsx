import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const WIDTH = 160;
const PAD = 12; // room above the string (and below its lowest point)
const MAX_UP = 10;

/**
 * A horizontal line that behaves like a guitar string: it bends toward the cursor while
 * hovered – down as far as `reach` px – and, when released, vibrates back to rest.
 */
export default function GuitarString({ reach = 60, className = '' }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const reachRef = useRef(reach);
  reachRef.current = reach;

  const height = PAD + reach + PAD;

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    const bend = { x: WIDTH / 2, y: 0 };
    const draw = () => {
      // Quadratic curve: the control point is pulled by twice the visible bend.
      path.setAttribute('d', `M0 ${PAD} Q ${bend.x} ${PAD + bend.y * 2} ${WIDTH} ${PAD}`);
    };
    draw();

    const onMove = (e) => {
      const box = wrap.getBoundingClientRect();
      const x = gsap.utils.clamp(0, WIDTH, ((e.clientX - box.left) / box.width) * WIDTH);
      const y = gsap.utils.clamp(-MAX_UP, reachRef.current, e.clientY - box.top - PAD);
      gsap.to(bend, { x, y, duration: 0.2, ease: 'power2.out', overwrite: true, onUpdate: draw });
      gsap.to(path, { attr: { stroke: '#6b7280' }, duration: 0.2, overwrite: 'auto' });
    };

    const release = () => {
      // Pluck: snap through the rest position and ring out – deeper pulls ring longer.
      const depth = Math.min(Math.abs(bend.y) / reachRef.current, 1);
      gsap.to(bend, {
        y: 0,
        duration: 1.8 + depth * 1.2,
        ease: 'elastic.out(1.1, 0.06)',
        overwrite: true,
        onUpdate: draw,
      });
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
    <div ref={wrapRef} className={`cursor-pointer ${className}`} style={{ width: WIDTH, height }} aria-hidden="true">
      <svg width={WIDTH} height={height} viewBox={`0 0 ${WIDTH} ${height}`} className="overflow-visible">
        <path ref={pathRef} d={`M0 ${PAD} L${WIDTH} ${PAD}`} fill="none" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
