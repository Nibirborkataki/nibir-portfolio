import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    let lastWidth = window.innerWidth;
    const handleResize = () => {
      // Ignore height-only changes on mobile (address bar hiding/showing) to prevent lag
      if (window.innerWidth !== lastWidth || canvas.width === 0) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        lastWidth = window.innerWidth;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2.5 + 1;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = Math.random() * 1.5 + 0.5; // Falling down
        this.alpha = 0.65;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.012; // Slower decay = longer lifespan (more density)
      }

      draw() {
        ctx.fillStyle = `rgba(120, 120, 120, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const handleMouseMove = (e) => {
      for (let i = 0; i < 4; i++) { // Increased from 3 to 4 particles
        particles.push(new Particle(e.clientX, e.clientY));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="hoverCanvas"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-40"
      aria-hidden="true"
    />
  );
}
