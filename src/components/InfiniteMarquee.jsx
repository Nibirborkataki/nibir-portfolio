import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function InfiniteMarquee() {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  const marqueeText =
    "I Build Modern Web Experiences • I Design Clean Interfaces • I Solve Real Problems • I Build Modern Web Experiences • I Design Clean Interfaces • I Solve Real Problems";

  useGSAP(
    () => {
      const text = textRef.current;
      const container = containerRef.current;
      if (!text || !container) return;

      const getDistance = () => {
        return Math.max(200, text.scrollWidth - window.innerWidth + 100);
      };

      gsap.fromTo(
        text,
        { x: 0 },
        {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="horizontal-scroll"
      ref={containerRef}
      className="relative w-full py-16 md:py-20 bg-white overflow-hidden select-none border-y border-gray-100 flex items-center"
    >
      <div className="w-full flex items-center">
        <h1
          ref={textRef}
          className="whitespace-nowrap text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-gray-900 will-change-transform pl-4 md:pl-8 leading-none"
        >
          {marqueeText}
        </h1>
      </div>
    </section>
  );
}
