import React, { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LoadingScreen from './components/LoadingScreen';
import { setLenis } from './utils/lenis';
import { hasFinePointer } from './utils/pointer';
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
import Projects from './components/Projects';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import NetworkBackground from './components/NetworkBackground';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showBackground, setShowBackground] = useState(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Mobile address-bar show/hide shouldn't re-measure every trigger mid-scroll.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      // Let Lenis handle "#section" links so they glide instead of fighting CSS smooth scroll.
      anchors: { offset: -20 },
    });
    lenisRef.current = lenis;
    setLenis(lenis);

    // Keep the page pinned to the top while the loading screen is up.
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = 'hidden';
    lenis.stop();

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const handleLoaded = useCallback(() => {
    setLoading(false);
    document.documentElement.style.overflow = '';
    lenisRef.current?.start();
    ScrollTrigger.refresh();
    // The network background fades in once the page is revealed.
    setShowBackground(true);
  }, []);

  return (
    // No background here: the page's white comes from <body>, so the network layer
    // (behind all content) can show through.
    <div className="text-gray-900 flex flex-col min-h-screen overflow-x-clip">
      {loading && <LoadingScreen onFinish={handleLoaded} />}
      {showBackground && <NetworkBackground />}
      {/* Cursor effects only with a real mouse – on touch screens taps would trigger them */}
      {hasFinePointer() && <CustomCursor />}
      {/* Particle Canvas on hover/mouse move */}
      {hasFinePointer() && <ParticleCanvas />}

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

      {/* Selected Projects */}
      <Projects />

      {/* Testimonials / Kind Words */}
      <Testimonials />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />
    </div>
  );
}
