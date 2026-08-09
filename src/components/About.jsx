import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);

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
        )
        .from(
          '.about-text',
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
          },
          '-=0.3'
        );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 py-12 bg-white mt-10">
      <h2 className="about-title text-3xl font-bold text-start text-gray-800 mb-6">About Me</h2>
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="about-bar h-1 bg-gray-300 w-[160px] mt-3 shrink-0 hidden md:block"></div>
        <p className="about-text text-gray-700 text-lg leading-relaxed">
          Hello! I'm a passionate developer and designer who has recently completed a Master's in Information
          Technology. Over the past 3 years, I've been honing my skills in{' '}
          <strong>full-stack development, user experience design, and creative problem-solving.</strong>
          <br />
          <br />
          I thrive on turning complex ideas into intuitive and elegant solutions. From building clean
          frontends to managing robust backends, I enjoy every step of the development process.
          <br />
          <br />
          Outside of work, you'll find me sketching abstract art, strumming my guitar, exploring scenic bike
          trails, or planning my next travel adventure. These hobbies keep my creativity alive and constantly
          inspire my work.
          <br />
          <br />
          Whether it's solving a tricky bug, designing user-centric interfaces, or discovering a hidden gem on
          a road trip — I’m always excited to learn, grow, and share the journey.
        </p>
      </div>
    </section>
  );
}
