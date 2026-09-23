import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { onAppReady } from "../utils/appReady";

gsap.registerPlugin(ScrollTrigger);

function StatItem({ target, label }) {
  const elementRef = useRef(null);
  const counterRef = useRef(null);

  useGSAP(
    () => {
      const counter = counterRef.current;
      const counterObj = { value: 0 };
      const render = () => {
        counter.textContent = `${Math.floor(counterObj.value)}+`;
      };

      // Count up every time the stats come into view (from either direction)...
      const play = () => {
        counterObj.value = 0;
        render();
        gsap.to(counterObj, { value: target, duration: 1.4, ease: "power2.out", overwrite: true, onUpdate: render });
      };
      // ...and quietly reset once they're off screen, ready for the next visit.
      const reset = () => {
        gsap.killTweensOf(counterObj);
        counterObj.value = 0;
        render();
      };

      let trigger;
      // Wait for the loading screen so the first count isn't spent behind it.
      const stopWaiting = onAppReady(() => {
        trigger = ScrollTrigger.create({
          trigger: elementRef.current,
          start: "top 85%",
          end: "bottom 15%",
          onEnter: play,
          onEnterBack: play,
          onLeave: reset,
          onLeaveBack: reset,
        });
      });

      return () => {
        stopWaiting();
        trigger?.kill();
      };
    },
    {
      scope: elementRef,
    }
  );

  return (
    <div
      ref={elementRef}
      className="stat-card flex flex-col items-center"
    >
      <h2
        ref={counterRef}
        className="text-5xl font-bold text-gray-900"
      >
        0+
      </h2>

      <p className="text-lg text-gray-600 mt-2">
        {label}
      </p>
    </div>
  );
}

export default function Stats() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      gsap.from(".stat-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        y: 35,
        scale: 0.95,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
      });
    },
    {
      scope: sectionRef,
    }
  );

  const stats = [
    {
      target: 7,
      label: "Satisfied Clients",
    },
    {
      target: 8,
      label: "Completed Projects",
    },
    {
      target: 5,
      label: "Customer Reviews",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 text-center"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {stats.map((stat, i) => (
          <StatItem
            key={i}
            target={stat.target}
            label={stat.label}
          />
        ))}
      </div>
    </section>
  );
}