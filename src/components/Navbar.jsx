import React, { useState, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Initial Navbar Animation
  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },

        onComplete: () => {
          gsap.set(['.nav-logo', '.nav-item'], {
            clearProps: 'opacity,transform',
          });
        },
      });

      tl.from('.nav-logo', {
        y: -20,
        opacity: 0,
        duration: 0.6,
      }).from(
        '.nav-item',
        {
          y: -15,
          opacity: 0,
          stagger: 0.08,
          duration: 0.5,
        },
        '-=0.3'
      );
    },
    {
      scope: navRef,
    }
  );

  const navLinks = [
    {
      label: 'Home',
      href: '#home',
    },
    {
      label: 'Skill',
      href: '#skills',
    },
    {
      label: 'Journey',
      href: '#journey',
    },
    {
      label: 'Reviews',
      href: '#reviews',
    },
    {
      label: 'Contact',
      href: '#contact',
    },
  ];

  // X-Axis 3D Flip Animation
  const handleFlipEnter = (e) => {
    const el = e.currentTarget;

    // Stop any previous animation
    gsap.killTweensOf(el);

    // Always start from the normal position
    gsap.set(el, {
      rotationX: 0,
      transformPerspective: 800,
      transformOrigin: 'center center',
    });

    // Flip around X-axis
    gsap.to(el, {
      rotationX: 360,
      duration: 0.7,
      ease: 'power2.inOut',

      // Reset after completing the animation
      onComplete: () => {
        gsap.set(el, {
          rotationX: 0,
        });
      },
    });
  };

  const handleFlipLeave = (e) => {
    const el = e.currentTarget;

    // Stop any current animation
    gsap.killTweensOf(el);

    // Return smoothly to normal X-axis position
    gsap.to(el, {
      rotationX: 0,
      duration: 0.35,
      ease: 'power2.out',
    });
  };

  return (
    <header
      ref={navRef}
      className="relative w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-8 py-4 bg-white"
    >
      {/* Logo */}
      <div className="nav-logo bg-gray-900 px-6 h-10 flex items-center justify-center text-white md:mr-5 rounded-sm">
        <h1 className="text-xl font-bold tracking-wider">
          N. Borkataki
        </h1>
      </div>

      {/* Desktop Navigation */}
      <nav
        className="hidden md:block"
        style={{
          perspective: 800,
        }}
      >
        <ul className="flex space-x-6 md:space-x-8 py-2 px-4 pr-12 md:pr-16">
          {navLinks.map((link) => (
            <li
              key={link.label}
              className="nav-item"
            >
              <a
                href={link.href}
                onMouseEnter={handleFlipEnter}
                onMouseLeave={handleFlipLeave}
                className="inline-block text-sm md:text-base uppercase tracking-wide text-gray-700 hover:text-black font-medium transition-colors cursor-pointer py-1"
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center',
                  willChange: 'transform',
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-black hover:text-neutral-600 focus:outline-none relative z-50"
        aria-label="Toggle Navigation Menu"
      >
        {mobileMenuOpen ? (
          <X size={24} />
        ) : (
          <Menu size={24} />
        )}
      </button>

      {/* Mobile Dropdown Menu */}
      <div 
        className={`md:hidden fixed inset-0 bg-white z-40 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}
      >
        <ul className="flex flex-col space-y-8 text-center">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-2xl uppercase tracking-widest font-bold text-gray-800 py-2 hover:text-black hover:scale-110 transition-transform"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}