import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLenis } from '../utils/lenis';

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_TEXT = 'I Build Modern Web Experiences • I Design Clean Interfaces • I Solve Real Problems';
const DRAG_SPEED = 1.5;

export default function InfiniteMarquee() {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const textRef = useRef(null);
  const triggerRef = useRef(null);
  const dragRef = useRef(null);

  // Pin the section and turn vertical scroll into a horizontal run through the whole sentence.
  useGSAP(
    () => {
      const text = textRef.current;
      const distance = () => Math.max(0, text.scrollWidth - window.innerWidth);

      const tween = gsap.to(text, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'center center',
          end: () => `+=${distance()}`,
          pin: true,
          // The app root is a flex column, where GSAP defaults this to false.
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      triggerRef.current = tween.scrollTrigger;

      // Headings get re-rendered into per-letter spans after mount; re-measure once fonts settle.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: containerRef }
  );

  useEffect(() => {
    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
  }, []);

  // Dragging scrubs the same pinned scroll range, so drag and scroll never disagree.
  useEffect(() => {
    const scrollTo = (y) => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    };

    const onMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      e.preventDefault();
      const st = triggerRef.current;
      const target = drag.startScroll - (e.clientX - drag.startX) * DRAG_SPEED;
      scrollTo(gsap.utils.clamp(st.start, st.end, target));
    };

    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleMouseDown = (e) => {
    const st = triggerRef.current;
    // Only drag while the line is pinned; elsewhere a drag would yank the page.
    if (e.button !== 0 || !st?.isActive) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startScroll: st.scroll() };
    gsap.to(cursorRef.current, { scale: 0.85, duration: 0.2 });
  };

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;
    gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
  };

  const handleMouseEnter = (e) => {
    if (window.innerWidth < 768) return;
    gsap.set(cursorRef.current, { x: e.clientX, y: e.clientY });
    gsap.to(cursorRef.current, { scale: 1, opacity: 1, duration: 0.3 });
  };

  const handleMouseLeave = () => {
    if (dragRef.current) return; // keep the cursor while a drag continues outside
    gsap.to(cursorRef.current, { scale: 0, opacity: 0, duration: 0.3 });
  };

  return (
    <section
      id="horizontal-scroll"
      ref={containerRef}
      className="relative w-full py-16 md:py-24 bg-white md:border-y border-gray-100 flex items-center overflow-hidden md:cursor-none select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
    >
      {/* Custom drag cursor for desktop – portalled so the pinned section can't offset it */}
      {createPortal(
        <div
          ref={cursorRef}
          className="hidden md:flex fixed top-0 left-0 w-16 h-16 bg-black rounded-full pointer-events-none z-[100] opacity-0 scale-0 items-center justify-center text-white shadow-xl"
        >
          <ChevronLeft size={24} className="-mr-1" />
          <ChevronRight size={24} className="-ml-1" />
        </div>,
        document.body
      )}

      <h1
        ref={textRef}
        className="whitespace-nowrap text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-gray-900 leading-none py-4 px-4 md:px-8 inline-block will-change-transform"
      >
        {MARQUEE_TEXT}
      </h1>
    </section>
  );
}
