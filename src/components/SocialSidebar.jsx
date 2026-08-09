import React, { useRef } from 'react';
import { Github, Linkedin, Instagram, Facebook } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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

export default function SocialSidebar() {
  const sidebarRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '.social-icon-link',
        { x: 20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.5,
          delay: 0.3,
          ease: 'power3.out',
          onComplete: () => {
            gsap.set('.social-icon-link', { clearProps: 'all' });
          },
        }
      );
    },
    { scope: sidebarRef }
  );

  return (
    <aside
      ref={sidebarRef}
      className="hidden md:flex fixed right-4 md:right-6 top-24 flex-col space-y-4 z-40"
      aria-label="Social media channels"
    >
      <a
        href="https://wa.me/918822546375"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon-link text-gray-800 hover:text-black text-2xl transform hover:scale-110 transition-all p-1"
        aria-label="WhatsApp"
      >
        <WhatsappIcon size={20} />
      </a>
      <a
        href="https://www.facebook.com/nibir.borkataki"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon-link text-gray-800 hover:text-black text-2xl transform hover:scale-110 transition-all p-1"
        aria-label="Facebook"
      >
        <Facebook size={20} />
      </a>
      <a
        href="https://www.instagram.com/nibirborkataki/"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon-link text-gray-800 hover:text-black text-2xl transform hover:scale-110 transition-all p-1"
        aria-label="Instagram"
      >
        <Instagram size={20} />
      </a>
      <a
        href="https://github.com/nibirborkataki"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon-link text-gray-800 hover:text-black text-2xl transform hover:scale-110 transition-all p-1"
        aria-label="GitHub"
      >
        <Github size={20} />
      </a>
      <a
        href="https://www.linkedin.com/in/nibir-borkataki-a39919254/"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon-link text-gray-700 hover:text-black text-2xl transform hover:scale-110 transition-all p-1"
        aria-label="LinkedIn"
      >
        <Linkedin size={20} />
      </a>
    </aside>
  );
}
