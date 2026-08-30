import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function InfiniteMarquee() {
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const cursorRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const marqueeText = Array(4).fill(
    "I Build Modern Web Experiences • I Design Clean Interfaces • I Solve Real Problems"
  ).join(" • ");

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
    gsap.to(cursorRef.current, { scale: 0.85, duration: 0.2 });
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    gsap.to(cursorRef.current, { scale: 0, opacity: 0, duration: 0.3 });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
  };

  const handleMouseMove = (e) => {
    if (window.innerWidth >= 768) {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out'
      });
    }

    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      gsap.to(cursorRef.current, { scale: 1, opacity: 1, duration: 0.3 });
    }
  };

  useEffect(() => {
    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
  }, []);

  return (
    <section
      id="horizontal-scroll"
      ref={containerRef}
      className="relative w-full py-16 md:py-24 bg-white border-y border-gray-100 flex items-center md:cursor-none select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Custom Drag Cursor for Desktop */}
      <div 
        ref={cursorRef}
        className="hidden md:flex fixed top-0 left-0 w-16 h-16 bg-black rounded-full pointer-events-none z-[100] opacity-0 scale-0 items-center justify-center text-white shadow-xl"
      >
        <ChevronLeft size={24} className="-mr-1" />
        <ChevronRight size={24} className="-ml-1" />
      </div>

      <div 
        ref={scrollContainerRef}
        className="w-full flex items-center overflow-x-auto no-scrollbar"
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
      >
        <h1 className="whitespace-nowrap text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-gray-900 pl-4 md:pl-8 leading-none py-4 pr-8">
          {marqueeText}
        </h1>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
