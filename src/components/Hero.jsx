import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const WhatsappIcon = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.061-.3-.15-1.265-.462-2.406-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.098-.205.048-.39-.029-.542-.074-.15-.673-1.62-.922-2.206-.24-.579-.487-.501-.673-.51l-.573-.01c-.198 0-.52.074-.792.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.21 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.767-.721 2.016-1.42.248-.7.248-1.295.173-1.42-.074-.124-.272-.198-.57-.345z" />
    <path d="M11.953 2a10 10 0 0 0-8.623 15.02L2 22l5.066-1.33A10 10 0 1 0 11.953 2z" />
  </svg>
);

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
            href="https://wa.me/918822546375"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-sm hover:-translate-y-1 hover:shadow-lg transition-all text-sm font-semibold uppercase tracking-wider"
          >
            Hire Me
            <WhatsappIcon size={18} />
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