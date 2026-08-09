import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef(null);

  useGSAP(
    () => {
      gsap.from('.footer-content', {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 95%',
          toggleActions: 'play none none reverse',
        },
        y: 35,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
    },
    { scope: footerRef }
  );

  return (
    <footer ref={footerRef} className="bg-black w-full mt-auto px-6 lg:px-20">
      <div className="footer-content w-full max-w-[1920px] mx-auto px-6 md:px-12 py-12">
        {/* Top Border */}
        <div className="border-t border-gray-800 mb-10"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          {/* Left Side */}
          <div className="max-w-sm">
            <h2 className="text-white text-2xl font-bold mb-3 tracking-tight">
              N. Borkataki
            </h2>

            <p className="text-gray-400 text-sm italic leading-relaxed mb-6">
              "Crafting digital experiences that seamlessly bridge the gap between elegant aesthetics and robust functionality."
            </p>

            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-600">
              © {new Date().getFullYear()} NIBIR BORKATAKI. ALL RIGHTS RESERVED.
            </div>
          </div>

          {/* Right Side */}
          <div className="flex gap-16">
            {/* Explore */}
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] opacity-50">
                Explore
              </h4>

              <a href="#home" className="text-xs text-gray-400 hover:text-white transition">
                Home
              </a>
              <a href="#skills" className="text-xs text-gray-400 hover:text-white transition">
                Skill
              </a>
              <a href="#reviews" className="text-xs text-gray-400 hover:text-white transition">
                Reviews
              </a>
              <a href="#contact" className="text-xs text-gray-400 hover:text-white transition">
                Contact
              </a>
            </div>

            {/* Connect */}
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] opacity-50">
                Connect
              </h4>

              <a
                href="https://www.linkedin.com/in/nibir-borkataki-a39919254/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white transition"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/nibirborkataki"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white transition"
              >
                GitHub
              </a>
              <a
                href="https://www.instagram.com/nibirborkataki/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white transition"
              >
                Instagram
              </a>
              <a
                href="mailto:nibirborkataki2015@gmail.com"
                className="text-xs text-gray-400 hover:text-white transition"
              >
                Email
              </a>
              <a
                href="https://wa.me/918822546375"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white transition"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
