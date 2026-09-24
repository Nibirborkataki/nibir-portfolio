import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const ballRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ball = ballRef.current;
    if (!cursor || !ball) return;
    
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power2.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power2.out' });

    // Squash & stretch: the ball elongates along its direction of travel and
    // springs back to round as it slows down.
    let prevX = 0;
    let prevY = 0;
    let stretch = 0;
    let angle = 0;
    const deform = () => {
      const x = gsap.getProperty(cursor, 'x');
      const y = gsap.getProperty(cursor, 'y');
      const dx = x - prevX;
      const dy = y - prevY;
      prevX = x;
      prevY = y;
      const speed = Math.hypot(dx, dy);
      if (speed > 0.6) angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      stretch += (Math.min(speed / 45, 0.42) - stretch) * 0.22;
      gsap.set(ball, { rotation: angle, scaleX: 1 + stretch, scaleY: 1 - stretch * 0.55 });
    };
    gsap.ticker.add(deform);

    const handleMouseMove = (e) => {
      // Only run on desktop
      if (window.innerWidth < 768) return;

      xTo(e.clientX);
      yTo(e.clientY);

      const chars = document.querySelectorAll('.fisheye-char');
      let isHoveringInteractive = false;
      
      chars.forEach((char) => {
        const rect = char.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return; // Hidden element

        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - charCenterX, e.clientY - charCenterY);
        
        const maxDist = 45;
        if (dist < maxDist) {
          isHoveringInteractive = true;
          const scale = 1 + ((maxDist - dist) / maxDist) * 0.75;
          gsap.to(char, {
            scale: scale,
            y: -((maxDist - dist) / maxDist) * 3,
            duration: 0.1,
            ease: 'power1.out',
          });
        } else {
          // Check if char is currently scaled before scaling down to save performance
          if (char._isFisheyeScaled) {
            gsap.to(char, {
              scale: 1,
              y: 0,
              duration: 0.2,
              ease: 'power1.out',
              onComplete: () => { char._isFisheyeScaled = false; }
            });
          }
        }

        if (dist < maxDist) {
            char._isFisheyeScaled = true;
        }
      });

      if (e.target.closest?.('[data-cursor="lens"]')) {
        // An element with its own lens effect takes over from the ball.
        gsap.to(cursor, { scale: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      } else if (isHoveringInteractive) {
        gsap.to(cursor, { scale: 2, duration: 0.3, ease: 'back.out(1.5)', overwrite: 'auto' });
      } else {
        const target = e.target;
        if (target.closest('a') || target.closest('button')) {
          gsap.to(cursor, { scale: 1.5, duration: 0.2, overwrite: 'auto' });
        } else {
          gsap.to(cursor, { scale: 1, duration: 0.2, overwrite: 'auto' });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const processHeaders = () => {
      const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headers.forEach(header => {
        if (header.classList.contains('fisheye-processed') || header.closest('[data-no-fisheye]')) return;
        header.classList.add('fisheye-processed');
        
        const walk = document.createTreeWalker(header, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        let n;
        while(n = walk.nextNode()) textNodes.push(n);
        
        textNodes.forEach(node => {
          if (!node.nodeValue.trim()) return;
          const fragment = document.createDocumentFragment();
          
          // Split by words first to prevent character breaking across lines
          const words = node.nodeValue.split(/(\s+)/); // Keep spaces as separate tokens
          
          words.forEach(word => {
            if (word.trim() === '') {
              // It's just space(s)
              fragment.appendChild(document.createTextNode(word));
            } else {
              // It's a word, wrap it in a span with whitespace-nowrap
              const wordSpan = document.createElement('span');
              wordSpan.className = 'inline-block whitespace-nowrap';
              
              const chars = word.split('');
              chars.forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.className = 'fisheye-char inline-block origin-bottom pointer-events-none transition-colors duration-200';
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
              });
              fragment.appendChild(wordSpan);
            }
          });
          
          node.parentNode.replaceChild(fragment, node);
        });
      });
    };

    // Run processing
    setTimeout(processHeaders, 300);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(deform);
    };
  }, []);

  return (
    // Outer element follows the mouse and handles hover scaling; the inner ball deforms.
    <div 
      ref={cursorRef}
      className="hidden md:block fixed top-0 left-0 w-8 h-8 mix-blend-difference pointer-events-none z-[9999]"
      style={{ willChange: 'transform' }}
    >
      <div ref={ballRef} className="w-full h-full bg-white rounded-full" style={{ willChange: 'transform' }} />
    </div>
  );
}
