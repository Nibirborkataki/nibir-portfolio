import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

function StatItem({ target, label }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);

  useGSAP(
    () => {
      const el = elementRef.current;
      const counterObj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          gsap.to(counterObj, {
            val: target,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate: () => {
              setCount(Math.floor(counterObj.val));
            },
          });
        },
        onLeaveBack: () => {
          counterObj.val = 0;
          setCount(0);
        },
      });
    },
    { scope: elementRef }
  );

  return (
    <div ref={elementRef} className="stat-card flex flex-col items-center">
      <h2 className="text-5xl font-bold text-gray-900 counter">
        {count}+
      </h2>
      <p className="text-lg text-gray-600 mt-2">{label}</p>
    </div>
  );
}

export default function Stats() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      gsap.from('.stat-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 35,
        scale: 0.95,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
      });
    },
    { scope: sectionRef }
  );

  const stats = [
    { target: 10, label: 'Satisfied Clients' },
    { target: 10, label: 'Completed Projects' },
    { target: 15, label: 'Customer Reviews' },
  ];

  return (
    <section ref={sectionRef} className="py-20 text-center">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {stats.map((stat, i) => (
          <StatItem key={i} target={stat.target} label={stat.label} />
        ))}
      </div>
    </section>
  );
}
