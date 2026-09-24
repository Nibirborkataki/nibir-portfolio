import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import GuitarString from './GuitarString';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const barRef = useRef(null);
  // How far the string may bend: down to the "I thrive on…" line (depends on text wrapping).
  const [stringReach, setStringReach] = useState(88);

  useEffect(() => {
    const measure = () => {
      const bar = barRef.current;
      const target = textRef.current?.querySelector('[data-string-target]');
      if (!bar || !target || !bar.offsetParent) return;
      const barTop = bar.getBoundingClientRect().top;
      const t = target.getBoundingClientRect();
      // String sits 12px below the bar's top edge; aim for the middle of that line.
      setStringReach(Math.max(40, Math.round(t.top + t.height / 2 - (barTop + 12))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(textRef.current);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.from('.about-title', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
        .from(
          '.about-bar',
          {
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.3'
        );

      // Text reveal animation
      gsap.to('.word', {
        opacity: 1,
        stagger: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 1,
        },
      });
    },
    { scope: sectionRef }
  );

  const splitText = (text, markFirst = false) => {
    return text.split(' ').map((word, i) => (
      <span key={i} className="word opacity-20" data-string-target={markFirst && i === 0 ? '' : undefined}>
        {word}{' '}
      </span>
    ));
  };

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 py-12 bg-white mt-10">
      <h2 className="about-title text-3xl font-bold text-start text-gray-800 mb-6">About Me</h2>
      <div className="flex flex-col md:flex-row items-start gap-4">
        {/* Hover it: it plucks like a guitar string */}
        <div ref={barRef} className="about-bar shrink-0 hidden md:block mt-1">
          <GuitarString reach={stringReach} />
        </div>
        <p ref={textRef} className="about-text text-gray-700 text-lg leading-relaxed flex-1">
          {splitText("Hello! I'm a passionate developer and designer who has recently completed a Master's in Information Technology. Over the past 3 years, I've been honing my skills in")}
          <strong>
            {splitText("full-stack development, user experience design, and creative problem-solving.")}
          </strong>
          <br />
          <br />
          {splitText("I thrive on turning complex ideas into intuitive and elegant solutions. From building clean frontends to managing robust backends, I enjoy every step of the development process.", true)}
          <br />
          <br />
          {splitText("Outside of work, you'll find me sketching abstract art, strumming my guitar, exploring scenic bike trails, or planning my next travel adventure. These hobbies keep my creativity alive and constantly inspire my work.")}
          <br />
          <br />
          {splitText("Whether it's solving a tricky bug, designing user-centric interfaces, or discovering a hidden gem on a road trip — I’m always excited to learn, grow, and share the journey.")}
        </p>
      </div>
    </section>
  );
}
