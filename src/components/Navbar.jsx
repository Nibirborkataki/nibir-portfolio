import React, { useState, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Initial Navbar Animation & Cursor Setup
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
    { label: 'Home', href: '#home' },
    { label: 'Skill', href: '#skills' },
    { label: 'Journey', href: '#journey' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ];

  // Global CustomCursor component handles the fisheye effect via the .fisheye-char class

  return (
    <header
      ref={navRef}
      className="relative w-full flex flex-row items-center justify-between px-0 py-0 md:px-8 md:py-4 bg-white"
    >


      {/* Logo - kept out of the cursor's fisheye effect so the letters stay inside the box */}
      <div data-no-fisheye className="nav-logo bg-gray-900 px-6 h-10 flex items-center justify-center text-white md:mr-5 rounded-sm">
        <h1 className="text-xl font-bold tracking-wider">
          N. Borkataki
        </h1>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block z-10">
        <ul className="flex space-x-6 md:space-x-8 py-2 px-4 pr-12 md:pr-16">
          {navLinks.map((link) => (
            <li key={link.label} className="nav-item">
              <a
                href={link.href}
                className="inline-flex text-sm md:text-base uppercase tracking-wide text-gray-700 font-medium py-1"
              >
                {link.label.split('').map((char, i) => (
                  <span key={i} className="fisheye-char inline-block origin-bottom pointer-events-none transition-colors duration-200">
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
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
          <X size={28} />
        ) : (
          <Menu size={28} />
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