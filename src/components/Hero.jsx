import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

import resumePdf from '../assets/Nibir_Borkataki_Resume_.pdf';

export default function Hero() {
  const containerRef = useRef(null);
  const imageContainerRef = useRef(null);

  useGSAP(
    () => {
      // Entrance Timeline on page load
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          gsap.set(['.hero-badge', '.hero-heading', '.hero-desc', '.hero-btn', imageContainerRef.current], {
            clearProps: 'opacity,transform',
          });
        },
      });

      tl.from('.hero-badge', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.1,
      })
        .from(
          '.hero-heading',
          {
            y: 35,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.4'
        )
        .from(
          '.hero-desc',
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
          },
          '-=0.5'
        )
        .from(
          '.hero-btn',
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.5'
        )
        .from(
          imageContainerRef.current,
          {
            scale: 0.92,
            opacity: 0,
            duration: 0.9,
          },
          '-=0.7'
        );

      // Subtle scroll parallax without opacity changes to prevent image disappearing
      gsap.to(imageContainerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        y: 30,
        ease: 'none',
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="home"
      ref={containerRef}
      className="flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20 xl:px-32 py-16 mt-8 md:mt-16 gap-12 max-w-[1920px] mx-auto w-full"
    >
      <div className="w-full lg:w-1/2 text-center lg:text-left z-10 lg:pl-8 xl:pl-16">
        <span className="hero-badge inline-block font-label text-[0.6875rem] uppercase tracking-[0.15em] font-semibold text-gray-500">
          Introduction / 01
        </span>
        <h2 className="hero-heading text-4xl md:text-6xl font-bold mt-4 leading-tight text-black">
          Hello! <br />
          <span className="italic font-light">I'm Nibir Borkataki</span>
        </h2>
        <p className="hero-desc text-gray-600 mt-6 text-sm md:text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
          Service Design &amp; Digital Strategy for brands and businesses. Helping companies turn their vision into products.
        </p>
        <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
          <a
            href="#contact"
            className="hero-btn inline-block px-8 py-3 bg-black text-white rounded-sm hover:-translate-y-1 hover:shadow-lg transition-all text-sm font-semibold uppercase tracking-wider"
          >
            Contact Me
          </a>
          <a
            href={resumePdf}
            download="Nibir_Borkataki_Resume.pdf"
            className="hero-btn inline-block px-8 py-3 bg-white text-black border border-black rounded-sm hover:-translate-y-1 hover:shadow-lg transition-all text-sm font-semibold uppercase tracking-wider"
          >
            Download CV
          </a>
        </div>
      </div>

      {/* Image Section */}
      <div
        ref={imageContainerRef}
        className="relative w-full max-w-[380px] h-[350px] lg:h-[420px] bg-gray-50 flex items-center justify-center mx-auto lg:ml-20 rounded-xl"
      >
        {/* Background Image (Animated Movement) */}
        <img
          src="/OIP.png"
          alt="Background"
          className="absolute left-[-20px] md:left-[-60px] top-0 w-[150px] md:w-[200px] h-full object-cover animate-move-bg z-0 opacity-50 mix-blend-multiply"
        />

        {/* White Box with 'Maac' */}
        <div className="absolute right-0 lg:right-[-40px] top-[75%] lg:top-[70%] bg-black px-6 py-3 border border-white shadow-xl z-20">
          <p className="text-white font-bold text-sm tracking-widest uppercase">Maac</p>
        </div>

        {/* Main Image */}
        <img
          src="/Images.png"
          alt="Main Image"
          className="relative w-[220px] lg:w-[300px] h-[320px] lg:h-[420px] object-cover z-10 drop-shadow-2xl"
        />
      </div>
    </section>
  );
}