import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLenis } from '../utils/lenis';

gsap.registerPlugin(ScrollTrigger, Observer);

const MARQUEE_TEXT = 'I Build Modern Web Experiences • I Design Clean Interfaces • I Solve Real Problems';
const DRAG_SPEED = 1.5;
const TOUCH_SPEED = 1.6;
// Crossing faster than this (px/s) – e.g. a nav-link jump or a hard fling – skips the lock.
const SKIP_VELOCITY = 6000;

export default function InfiniteMarquee() {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const textRef = useRef(null);
  const apiRef = useRef(null);
  const dragRef = useRef(null);

  // When the line reaches the middle of the screen the page pauses in place (the sections
  // above and below stay visible) and scroll input moves the sentence sideways instead.
  // Once the sentence is complete, scrolling carries on; the same in reverse going up.
  useGSAP(
    () => {
      const text = textRef.current;
      const html = document.documentElement;
      const distance = () => Math.max(1, text.scrollWidth - window.innerWidth);
      const setX = gsap.quickTo(text, 'x', { duration: 0.55, ease: 'power3.out' });

      // mode: 'before' = sentence at start, page above; 'after' = sentence done, page below.
      const state = { progress: 0, mode: 'before', locked: false, bypassUntil: 0 };
      const render = () => setX(-state.progress * distance());

      const scrollTo = (y) => {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
      };

      const observer = Observer.create({
        target: window,
        type: 'wheel,touch',
        wheelSpeed: -1, // make wheel and touch agree: negative deltaY = "scroll down"
        preventDefault: true,
        onChangeY: (self) => {
          if (!state.locked) return;
          const intent = -self.deltaY * (self.event.type.startsWith('touch') ? TOUCH_SPEED : 1);
          const next = state.progress + intent / distance();
          if (next >= 1 && intent > 0) return unlock('after');
          if (next <= 0 && intent < 0) return unlock('before');
          state.progress = gsap.utils.clamp(0, 1, next);
          render();
        },
      });
      observer.disable();

      const lock = () => {
        state.locked = true;
        scrollTo(trigger.start);
        getLenis()?.stop();
        html.style.overflow = 'hidden'; // stops native/touch momentum on mobile
        observer.enable();
      };

      function unlock(mode) {
        state.locked = false;
        state.mode = mode;
        state.progress = mode === 'after' ? 1 : 0;
        render();
        observer.disable();
        html.style.overflow = '';
        getLenis()?.start();
        // Step just past the trigger so it doesn't immediately re-lock.
        scrollTo(trigger.start + (mode === 'after' ? 2 : -2));
      }

      const crossing = (self, mode) => {
        const skip = performance.now() < state.bypassUntil || Math.abs(self.getVelocity()) > SKIP_VELOCITY;
        if (skip) {
          state.mode = mode;
          state.progress = mode === 'after' ? 1 : 0;
          render();
          return;
        }
        lock();
      };

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'center center',
        end: '+=1',
        onEnter: (self) => state.mode !== 'after' && crossing(self, 'after'),
        onEnterBack: (self) => state.mode !== 'before' && crossing(self, 'before'),
        onRefresh: () => {
          if (!state.locked) gsap.set(text, { x: -state.progress * distance() });
        },
      });

      // Landing mid-page (reload / deep link) below the line: show it completed.
      if (window.scrollY > trigger.start) {
        state.mode = 'after';
        state.progress = 1;
        gsap.set(text, { x: -distance() });
      }

      // In-page nav links jump straight past the marquee.
      const onClick = (e) => {
        if (e.target.closest?.('a[href^="#"]')) state.bypassUntil = performance.now() + 2500;
      };
      document.addEventListener('click', onClick, true);

      apiRef.current = {
        getProgress: () => state.progress,
        setProgress: (p) => {
          state.progress = gsap.utils.clamp(0, 1, p);
          render();
        },
        distance,
      };

      return () => {
        document.removeEventListener('click', onClick, true);
        if (state.locked) {
          html.style.overflow = '';
          getLenis()?.start();
        }
        observer.kill();
      };
    },
    { scope: containerRef }
  );

  useEffect(() => {
    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
  }, []);

  // Dragging moves the sentence directly.
  useEffect(() => {
    const onMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      e.preventDefault();
      const api = apiRef.current;
      api.setProgress(drag.startProgress - ((e.clientX - drag.startX) * DRAG_SPEED) / api.distance());
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
    if (e.button !== 0 || !apiRef.current) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startProgress: apiRef.current.getProgress() };
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
      {/* Custom drag cursor for desktop */}
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
