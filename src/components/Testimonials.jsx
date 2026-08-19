import React, { useRef } from 'react';
import { Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      // Header Animation
      gsap.from('.testimonials-header', {
        scrollTrigger: {
          trigger: '.testimonials-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 35,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });

      // Featured Quote Card Animation
      gsap.from('.featured-quote', {
        scrollTrigger: {
          trigger: '.featured-quote',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        x: -40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Side Testimonials Animation
      gsap.from('.side-testimonial', {
        scrollTrigger: {
          trigger: '.side-testimonials-col',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        x: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: 'power3.out',
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 md:px-12 py-24 bg-white mt-12 mb-12"
    >
      <div className="testimonials-header mb-16">
        <span className="font-label text-[0.6875rem] uppercase tracking-[0.15em] font-semibold text-gray-500">
          Testimonials / 04
        </span>
        <h2 className="text-6xl md:text-7xl font-bold tracking-tighter text-black mt-2">
          Kind Words
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 border-t border-gray-100 pt-16">
        {/* Featured Testimonial */}
        <div className="featured-quote lg:col-span-2 bg-gray-50 p-12 md:p-24 relative border border-gray-100">
          <span className="text-gray-200 text-6xl opacity-60 absolute top-12 left-12 font-serif select-none">
            “
          </span>
          <div className="relative z-10 pt-8 xl:pt-12">
            <h3 className="text-3xl md:text-5xl font-light italic leading-tight text-gray-800 mb-12">
              "Nibir brought an unparalleled level of creativity and technical expertise to our project.
              The attention to detail and ability to translate our vision into a polished digital
              experience exceeded all our expectations."
            </h3>
            <div className="border-t border-gray-200 w-full my-8"></div>
            <div>
              <p className="text-lg font-bold text-black uppercase tracking-wide">
                Dinamoni Bhandar
              </p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                Editor
              </p>
            </div>
          </div>
        </div>

        {/* Standard Testimonials Column */}
        <div className="side-testimonials-col flex flex-col gap-12 justify-center">
          {/* Single Testimonial 1 */}
          <div className="side-testimonial pb-8 border-b border-gray-100">
            <div className="flex gap-1 mb-6 text-black">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <p className="text-xl font-medium leading-relaxed text-black mb-8">
              "A truly seamless process from start to finish. The final product was not only beautiful but
              incredibly performant."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                <img
                  src="https://ui-avatars.com/api/?name=MK&background=000&color=fff"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-black">Runumi S Rajbongshi</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                  Senior Executive, ERC
                </p>
              </div>
            </div>
          </div>

          {/* Single Testimonial 2 */}
          <div className="side-testimonial">
            <div className="flex gap-1 mb-6 text-black">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <p className="text-xl font-medium leading-relaxed text-black mb-8">
              "Exemplary design skills coupled with a deep understanding of user experience. Highly
              recommended for any complex digital builds."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                <img
                  src="https://ui-avatars.com/api/?name=EL&background=000&color=fff"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-black">Hasin A Ahmed</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                  Assistand Professor
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
