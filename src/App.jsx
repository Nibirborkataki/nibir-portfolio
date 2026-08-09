import React from 'react';
import Navbar from './components/Navbar';
import ParticleCanvas from './components/ParticleCanvas';
import SocialSidebar from './components/SocialSidebar';
import Hero from './components/Hero';
import About from './components/About';
import Stats from './components/Stats';
import InfiniteMarquee from './components/InfiniteMarquee';
import SkillsBento from './components/SkillsBento';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="bg-white text-gray-900 overflow-x-hidden flex flex-col min-h-screen">
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

      {/* Testimonials / Kind Words */}
      <Testimonials />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />
    </div>
  );
}
