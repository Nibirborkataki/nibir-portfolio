import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLenis } from '../utils/lenis';
import { FINE_POINTER, COARSE_POINTER, hasFinePointer } from '../utils/pointer';

gsap.registerPlugin(ScrollTrigger, Observer);

const MARQUEE_TEXT = 'I Build Modern Web Experiences • I Design Clean Interfaces • I Solve Real Problems';
const DRAG_SPEED = 1.5;
const WHEEL_SPEED = 1.5;
const TOUCH_SPEED = 2.4;
// Momentum: after input stops the sentence keeps gliding, losing (1 - FRICTION) of its speed per frame.
const FRICTION = 0.9;
const WHEEL_GLIDE = 0.08; // share of each wheel step carried into the glide
const MAX_GLIDE = 0.03; // cap, in progress per frame
// Crossing faster than this (px/s) skips the lock. Kept very high: phone flings are fast and
// should still stop here; nav-link jumps are handled separately via bypassUntil.
const SKIP_VELOCITY = 20000;

export default function InfiniteMarquee() {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const textRef = useRef(null);
  const apiRef = useRef(null);
  const dragRef = useRef(null);

  useGSAP(
    () => {
      const text = textRef.current;
      const distance = () => Math.max(1, text.scrollWidth - window.innerWidth);
      const mm = gsap.matchMedia();

      // Touch screens: the sentence glides sideways in step with normal scrolling and is
      // complete before the line leaves the screen. Holding the page still isn't reliable
      // with phone momentum scrolling (it caused jumps), so no scroll-hijacking here.
      mm.add(COARSE_POINTER, () => {
        apiRef.current = null;
        gsap.fromTo(
          text,
          { x: 0 },
          {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              end: 'bottom 15%',
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      // Mouse/trackpad: when the line reaches the middle of the screen the page pauses in
      // place (the sections above and below stay visible) and scroll input moves the sentence
      // sideways instead. Once it's complete, scrolling carries on; the same in reverse.
      mm.add(FINE_POINTER, () => {
        const html = document.documentElement;
        const setX = gsap.quickTo(text, 'x', { duration: 0.5, ease: 'power3.out' });

        // mode: 'before' = sentence at start, page above; 'after' = sentence done, page below.
        // velocity is in progress-per-frame and drives the glide after input stops.
        const state = {
          progress: 0,
          mode: 'before',
          locked: false,
          bypassUntil: 0,
          velocity: 0,
          lastInput: 0,
          touching: false,
        };
        const render = () => setX(-state.progress * distance());
        const clampGlide = gsap.utils.clamp(-MAX_GLIDE, MAX_GLIDE);

        const glide = () => {
          if (state.touching || Math.abs(state.velocity) < 0.00002) return;
          if (performance.now() - state.lastInput < 60) return; // still receiving input
          const ratio = gsap.ticker.deltaRatio(60);
          state.progress = gsap.utils.clamp(0, 1, state.progress + state.velocity * ratio);
          state.velocity = state.progress === 0 || state.progress === 1 ? 0 : state.velocity * Math.pow(FRICTION, ratio);
          render();
        };
        gsap.ticker.add(glide);

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
          onPress: () => {
            state.touching = true;
            state.velocity = 0;
          },
          onRelease: (self) => {
            state.touching = false;
            if (!state.locked) return;
            // Carry the flick's speed into the glide (velocityY is px/s of the finger).
            state.velocity = clampGlide((-self.velocityY * TOUCH_SPEED) / distance() / 60 * 0.55);
          },
          onChangeY: (self) => {
            if (!state.locked) return;
            const isTouch = self.event.type.startsWith('touch');
            const intent = -self.deltaY * (isTouch ? TOUCH_SPEED : WHEEL_SPEED);
            // At either end, one more push in that direction releases the page.
            if (state.progress >= 1 && intent > 0) return unlock('after');
            if (state.progress <= 0 && intent < 0) return unlock('before');
            const delta = intent / distance();
            state.progress = gsap.utils.clamp(0, 1, state.progress + delta);
            state.lastInput = performance.now();
            if (!isTouch) state.velocity = clampGlide(delta * WHEEL_GLIDE);
            render();
          },
        });
        observer.disable();

        // While locked, hold the page exactly in place – phone scroll momentum can otherwise
        // keep carrying the page after the lock engages.
        const holdPosition = () => {
          if (state.locked && Math.abs(window.scrollY - trigger.start) > 1) window.scrollTo(0, trigger.start);
        };
        window.addEventListener('scroll', holdPosition, { passive: true });

        const lock = () => {
          state.locked = true;
          scrollTo(trigger.start);
          getLenis()?.stop();
          html.style.overflow = 'hidden'; // stops native/touch momentum on mobile
          observer.enable();
        };

        function unlock(mode) {
          state.locked = false;
          state.velocity = 0;
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

        // In-page nav links and "back to top" jump straight past the marquee.
        const onClick = (e) => {
          if (e.target.closest?.('a[href^="#"], [data-scroll-jump]')) state.bypassUntil = performance.now() + 2500;
        };
        document.addEventListener('click', onClick, true);

        apiRef.current = {
          getProgress: () => state.progress,
          setProgress: (p) => {
            state.progress = gsap.utils.clamp(0, 1, p);
            state.velocity = 0;
            state.lastInput = performance.now();
            render();
          },
          fling: (v) => {
            state.velocity = clampGlide(v);
          },
          distance,
        };

        return () => {
          gsap.ticker.remove(glide);
          window.removeEventListener('scroll', holdPosition);
          document.removeEventListener('click', onClick, true);
          if (state.locked) {
            html.style.overflow = '';
            getLenis()?.start();
          }
          observer.kill();
          apiRef.current = null;
        };
      });
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
      const progress = drag.startProgress - ((e.clientX - drag.startX) * DRAG_SPEED) / api.distance();
      const now = performance.now();
      const dt = Math.max(now - drag.lastTime, 1);
      // Track drag speed (progress per 60fps frame) for the release glide.
      drag.velocity = drag.velocity * 0.6 + ((progress - drag.lastProgress) / dt) * 16.7 * 0.4;
      drag.lastProgress = progress;
      drag.lastTime = now;
      api.setProgress(progress);
    };

    const onUp = () => {
      const drag = dragRef.current;
      if (!drag) return;
      // Only fling if the pointer was still moving when released.
      if (performance.now() - drag.lastTime < 80) apiRef.current?.fling(drag.velocity * 0.8);
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
    const startProgress = apiRef.current.getProgress();
    dragRef.current = {
      startX: e.clientX,
      startProgress,
      lastProgress: startProgress,
      lastTime: performance.now(),
      velocity: 0,
    };
    gsap.to(cursorRef.current, { scale: 0.85, duration: 0.2 });
  };

  const handleMouseMove = (e) => {
    if (!hasFinePointer()) return;
    gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
  };

  const handleMouseEnter = (e) => {
    if (!hasFinePointer()) return;
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
