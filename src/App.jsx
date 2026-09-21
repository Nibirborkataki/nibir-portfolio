import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import ParticleCanvas from './components/ParticleCanvas';
import SocialSidebar from './components/SocialSidebar';
import Hero from './components/Hero';
import About from './components/About';
import Stats from './components/Stats';
import InfiniteMarquee from './components/InfiniteMarquee';
import SkillsBento from './components/SkillsBento';
import Journey from './components/Journey';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-white text-gray-900 flex flex-col min-h-screen">
      <CustomCursor />
      {/* Particle Canvas on hover/mouse move */}
      <ParticleCanvas />

      {/* Navbar */}
      <Navbar />

      {/* Social Icons */}
      <SocialSidebar />

      {/* Hero Section */}
      <Hero />

      {/* About Me Section */}
      <About />

      {/* Stats Section */}
      <Stats />

      {/* Scrolling Big Text Effect */}
      <InfiniteMarquee />

      {/* Bento Grid Skills & Capabilities */}
      <SkillsBento />

      {/* The Professional Journey */}
      <Journey />

      {/* Testimonials / Kind Words */}
      <Testimonials />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />
    </div>
  );
}
