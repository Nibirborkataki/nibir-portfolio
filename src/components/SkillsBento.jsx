import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function SkillsBento() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      // Header Animation
      gsap.fromTo(
        '.skills-header',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.skills-header',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            gsap.set('.skills-header', { clearProps: 'all' });
          },
        }
      );

      // Bento Cards Staggered Reveal
      gsap.fromTo(
        '.bento-card',
        { y: 35, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.bento-grid',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            gsap.set('.bento-card', { clearProps: 'all' });
          },
        }
      );

      // Workflow Cards Staggered Reveal
      gsap.fromTo(
        '.workflow-card',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.workflow-grid',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            gsap.set('.workflow-card', { clearProps: 'all' });
          },
        }
      );

      // CTA Banner Reveal
      gsap.fromTo(
        '.skills-cta',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.skills-cta',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            gsap.set('.skills-cta', { clearProps: 'all' });
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section id="skills" ref={sectionRef} className="pt-24 md:pt-32 max-w-7xl mx-auto px-6 md:px-12 w-full">
      {/* Header Section */}
      <header className="skills-header mb-16 md:mb-24">
        <div className="flex flex-col gap-4">
          <span className="text-[0.6875rem] uppercase tracking-[0.15em] font-semibold text-gray-500">
            Capabilities / 02
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-black leading-[1.1]">
            The Technical<br />Foundations.
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mt-4 leading-relaxed">
            A curated collection of technical proficiencies and creative methodologies developed through years of architectural design thinking and digital execution.
          </p>
        </div>
      </header>

      {/* Bento Grid Skills Layout */}
      <div className="bento-grid grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Card 1: UI/UX Design */}
        <div className="bento-card md:col-span-8 bg-white border border-gray-200 p-8 md:p-10 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:border-gray-400 rounded-sm">
          <div>
            <div className="flex justify-between items-start mb-8 md:mb-12">
              <span className="material-symbols-outlined text-4xl text-black">
                architecture
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Level: Advanced
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-black">UI/UX Design</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md">
              Constructing digital experiences through a lens of core design principles and high-fidelity aesthetics.
            </p>
          </div>
          <div className="mt-10 md:mt-16 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              Figma
            </span>
            <span className="rounded-full bg-gray-100 py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              Design Systems
            </span>
            <span className="rounded-full bg-gray-100 py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              Wireframing
            </span>
            <span className="rounded-full bg-gray-100 py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              Prototyping
            </span>
          </div>
        </div>

        {/* Card 2: Machine Learning */}
        <div className="bento-card md:col-span-4 bg-black border border-black p-8 md:p-10 flex flex-col justify-between group transition-all duration-300 hover:shadow-2xl rounded-sm">
          <div>
            <div className="flex justify-between items-start mb-8 md:mb-12">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Level: Intermediate
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white">Machine Learning</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Integrating data-driven intelligence and predictive modeling into digital architectures.
            </p>
          </div>
          <div className="mt-10 md:mt-16 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-white">
              Python
            </span>
          </div>
        </div>

        {/* Card 3: Development */}
        <div className="bento-card md:col-span-4 bg-gray-50 border border-gray-200 p-8 md:p-10 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:border-gray-400 rounded-sm">
          <div>
            <div className="flex justify-between items-start mb-8 md:mb-12">
              <span className="material-symbols-outlined text-4xl text-black">
                code
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Level: Advanced
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-black">Development</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Building robust and scalable applications with modern full-stack technologies.
            </p>
          </div>
          <div className="mt-10 md:mt-16 flex flex-wrap gap-2">
            <span className="rounded-full bg-white py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 border border-gray-200">
              PHP
            </span>
            <span className="rounded-full bg-white py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 border border-gray-200">
              Node
            </span>
            <span className="rounded-full bg-white py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 border border-gray-200">
              React
            </span>
            <span className="rounded-full bg-white py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 border border-gray-200">
              Next JS
            </span>
          </div>
        </div>

        {/* Card 4: Hardware & Networking */}
        <div className="bento-card md:col-span-4 bg-white border border-gray-200 p-8 md:p-10 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:border-gray-400 rounded-sm">
          <div>
            <div className="flex justify-between items-start mb-8 md:mb-12">
              <span className="material-symbols-outlined text-4xl text-black">
                router
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Level: Intermediate
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-black">Networking</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Optimizing physical infrastructure and establishing secure network architectures.
            </p>
          </div>
          <div className="mt-10 md:mt-16 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              SysAdmin
            </span>
            <span className="rounded-full bg-gray-100 py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              Maintenance
            </span>
          </div>
        </div>

        {/* Card 5: Graphics Design */}
        <div className="bento-card md:col-span-4 relative group overflow-hidden bg-black border border-black min-h-[380px] rounded-sm">
          {/* Background Image */}
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
            src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop"
            alt="Graphics Background"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/70 to-transparent"></div>

          {/* Content */}
          <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-between">
            <div className="flex justify-end items-start mb-8">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                Level: Pro
              </span>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Graphics Design</h3>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                  Photoshop
                </span>
                <span className="rounded-full bg-white/20 py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                  Premiere Pro
                </span>
                <span className="rounded-full bg-white/20 py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                  Canva
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Complementary Tools: Workflow & Approach */}
        <div className="md:col-span-12 mt-8 md:mt-12">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Workflow &amp; Approach
          </h4>

          <p className="text-sm text-gray-500 max-w-md mb-8">
            A structured approach to building scalable and efficient digital solutions—focused on clean architecture, performance, and automation.
          </p>

          <div className="workflow-grid grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Workflow Card 1 */}
            <div className="workflow-card group relative bg-white border border-gray-200 p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-black hover:-translate-y-2 hover:shadow-xl cursor-pointer overflow-hidden rounded-sm">
              <div className="absolute left-0 top-0 h-full w-1 bg-black scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300"></div>
              <span className="material-symbols-outlined text-3xl text-black transition group-hover:scale-110">
                dataset
              </span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center group-hover:text-black">
                REST API Design
              </span>
            </div>

            {/* Workflow Card 2 */}
            <div className="workflow-card group relative bg-white border border-gray-200 p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-black hover:-translate-y-2 hover:shadow-xl cursor-pointer overflow-hidden rounded-sm">
              <div className="absolute left-0 top-0 h-full w-1 bg-black scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300"></div>
              <span className="material-symbols-outlined text-3xl text-black transition group-hover:scale-110">
                storage
              </span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center group-hover:text-black">
                Database Architecture
              </span>
            </div>

            {/* Workflow Card 3 */}
            <div className="workflow-card group relative bg-white border border-gray-200 p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-black hover:-translate-y-2 hover:shadow-xl cursor-pointer overflow-hidden rounded-sm">
              <div className="absolute left-0 top-0 h-full w-1 bg-black scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300"></div>
              <span className="material-symbols-outlined text-3xl text-black transition group-hover:scale-110">
                lock
              </span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center group-hover:text-black">
                JWT Authentication
              </span>
            </div>

            {/* Workflow Card 4 */}
            <div className="workflow-card group relative bg-white border border-gray-200 p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-black hover:-translate-y-2 hover:shadow-xl cursor-pointer overflow-hidden rounded-sm">
              <div className="absolute left-0 top-0 h-full w-1 bg-black scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300"></div>
              <span className="material-symbols-outlined text-3xl text-black transition group-hover:scale-110">
                smart_toy
              </span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center group-hover:text-black">
                Web Automation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <section className="skills-cta mt-24 md:mt-32 py-16 md:py-24 border-t border-zinc-200/40 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight mb-8">
          Ready to build something lasting?
        </h2>
        <a
          href="#contact"
          className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-lg transition-all duration-300 hover:bg-gray-900 group shadow-md"
        >
          <span className="text-sm uppercase tracking-widest font-semibold">
            Start a Conversation
          </span>
          <span className="flex items-center justify-center w-8 h-8 border border-white rounded-full transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </a>
      </section>
    </section>
  );
}
