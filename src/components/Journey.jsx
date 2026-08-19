import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import resumePdf from '../assets/Nibir_Borkataki_Resume_.pdf';

gsap.registerPlugin(ScrollTrigger);

export default function Journey() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      // Header Animation
      gsap.fromTo(
        '.journey-header',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.journey-header',
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            gsap.set('.journey-header', { clearProps: 'all' });
          },
        }
      );

      // Experience & Education items reveal
      gsap.fromTo(
        '.journey-item',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.journey-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            gsap.set('.journey-item', { clearProps: 'all' });
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section id="journey" ref={sectionRef} className="pt-24 md:pt-32 max-w-7xl mx-auto px-6 md:px-12 w-full">
      {/* Header Section */}
      <header className="journey-header mb-16 md:mb-24">
        <div className="flex flex-col gap-4">
          <span className="text-[0.6875rem] uppercase tracking-[0.15em] font-semibold text-gray-500">
            Journey / 03
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-black leading-[1.1]">
            The Professional<br />Journey.
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mt-4 leading-relaxed">
            A chronological curation of experiences, roles, and academic foundations that have shaped my design philosophy and technical execution.
          </p>
        </div>
      </header>

      {/* Experience & Education Grid */}
      <div className="journey-grid grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative">
        {/* Minimalist Timeline Line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2"></div>

        {/* Experience Column */}
        <div className="lg:col-span-6 space-y-16">
          <h2 className="text-3xl font-bold text-black mb-12 flex items-center gap-4">
            <span className="material-symbols-outlined text-2xl text-gray-500">work</span>
            Experience
          </h2>

          {/* Experience Item 1 */}
          <div className="journey-item group relative pl-8 border-l-2 border-transparent hover:border-black transition-colors duration-300">
            <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-black transition-colors duration-300"></div>
            <p className="text-[0.6875rem] font-bold text-gray-500 tracking-widest uppercase mb-2">2025 — Present</p>
            <h3 className="text-xl md:text-2xl font-bold text-black mb-1">Software Development Engineer 2</h3>
            <p className="text-base text-gray-600 font-medium mb-4">AlegraLabs GmbH, Guwahati</p>
            <ul className="text-sm md:text-base text-gray-600 space-y-2 list-none">
              <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-400 before:rounded-sm">Develop and maintain ERP systems and web applications using PHP, Laravel, Vue.js, and React.</li>
              <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-400 before:rounded-sm">Build scalable backend solutions and dynamic, responsive user interface for enterprise clients.</li>
              <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-400 before:rounded-sm">Design and implement Python-based web scraping and automation solutions using advance libraries.</li>
            </ul>
          </div>

          {/* Experience Item 2 */}
          <div className="journey-item group relative pl-8 border-l-2 border-transparent hover:border-black transition-colors duration-300">
            <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-black transition-colors duration-300"></div>
            <p className="text-[0.6875rem] font-bold text-gray-500 tracking-widest uppercase mb-2">2025 - present</p>
            <h3 className="text-xl md:text-2xl font-bold text-black mb-1">Freelance Full-Stack Developer | Remote</h3>
            <p className="text-base text-gray-600 font-medium mb-4">Sanskritir Dapoon</p>
            <ul className="text-sm md:text-base text-gray-600 space-y-2 list-none">
              <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-400 before:rounded-sm">Develop full-stack web applications using Node.js, delivering end-to-end features from database to UI.</li>
              <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-400 before:rounded-sm">Integrate third-party payment gateways and SMS APIs to support business-critical workflows.</li>
              <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-400 before:rounded-sm">Build responsive, scalable websites tailored to client requirements.</li>
            </ul>
          </div>

          {/* Experience Item 3 */}
          <div className="journey-item group relative pl-8 border-l-2 border-transparent hover:border-black transition-colors duration-300">
            <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-black transition-colors duration-300"></div>
            <p className="text-[0.6875rem] font-bold text-gray-500 tracking-widest uppercase mb-2">2024 — 2025</p>
            <h3 className="text-xl md:text-2xl font-bold text-black mb-1">MIS Executive</h3>
            <p className="text-base text-gray-600 font-medium mb-4">Flipkart, Guwahati</p>
            <ul className="text-sm md:text-base text-gray-600 space-y-2 list-none">
              <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-400 before:rounded-sm">Managed planning dashboards and MIS reporting for a regional cluster using advanced Excel and Python.</li>
              <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-400 before:rounded-sm">Developed automation scripts to streamline reportgeneration and imporove operational efficiency.</li>
            </ul>
          </div>
          <div className="journey-item group relative pl-8 border-l-2 border-transparent hover:border-black transition-colors duration-300">
  <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-black transition-colors duration-300"></div>

  <p className="text-[0.6875rem] font-bold text-gray-500 tracking-widest uppercase mb-2">
    2024
  </p>

  <h3 className="text-xl md:text-2xl font-bold text-black mb-1">
    Web Developer Intern
  </h3>

  <p className="text-base text-gray-600 font-medium mb-4">
    S&S Inc Media
  </p>

  <ul className="text-sm md:text-base text-gray-600 space-y-2 list-none">
    <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-400 before:rounded-sm">
      Worked on web development projects using React and PHP, building responsive and user-friendly web interfaces.
    </li>

    <li className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gray-400 before:rounded-sm">
      Gained hands-on experience in frontend development, backend integration, debugging, and maintaining web applications.
    </li>
  </ul>
</div>
        </div>

        {/* Education Column */}
        <div className="lg:col-span-6 space-y-16 mt-16 lg:mt-0">
          <h2 className="text-3xl font-bold text-black mb-12 flex items-center gap-4">
            <span className="material-symbols-outlined text-2xl text-gray-500">school</span>
            Education
          </h2>

          {/* Education Item 1 */}
          <div className="journey-item bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-gray-200 transition-all duration-300">
            <p className="text-[0.6875rem] font-bold text-gray-500 tracking-widest uppercase mb-2">2021 — 2023</p>
            <h3 className="text-xl md:text-2xl font-bold text-black mb-2">Master of Science in Information Technology</h3>
            <p className="text-base text-gray-600 font-medium">Gauhati University</p>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">Focused on Machine Learning and software development, with hands-on work in data analysis, computer vision, and intelligent systems. Developed practical experience in Python, machine learning frameworks, and web technologies.</p>
          </div>

          {/* Education Item 2 */}
          <div className="journey-item bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-gray-200 transition-all duration-300">
            <p className="text-[0.6875rem] font-bold text-gray-500 tracking-widest uppercase mb-2">2018 — 2021</p>
            <h3 className="text-xl md:text-2xl font-bold text-black mb-2">Bachelor of Science in Information technology</h3>
            <p className="text-base text-gray-600 font-medium">Lalit Chandra Bharali College</p>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">Built a strong foundation in web development and mobile application development, exploring programming, databases, software engineering, and application design through practical projects.</p>
          </div>

          {/* Certification Item */}
          <div className="journey-item bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-gray-200 transition-all duration-300">
            <p className="text-[0.6875rem] font-bold text-gray-500 tracking-widest uppercase mb-2">2018</p>
            <h3 className="text-xl md:text-2xl font-bold text-black mb-2">Higher Secondary</h3>
            <p className="text-base text-gray-600 font-medium">Kendriya Vidyalaya Maligaon</p>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">Developed a foundation in Computer Science and programming while studying the Science stream. This was where I began exploring programming concepts and developed my interest in technology and software development.</p>
          </div>
          {/* Education Item 4 */}
          <div className="journey-item bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-gray-200 transition-all duration-300">
            <p className="text-[0.6875rem] font-bold text-gray-500 tracking-widest uppercase mb-2">2015</p>
            <h3 className="text-xl md:text-2xl font-bold text-black mb-2">Higher School Education | CBSE </h3>
            <p className="text-base text-gray-600 font-medium">Gyan Educational Institute</p>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">Focused on building a strong foundation in core subjects including Physics, Chemistry, and Mathematics, which helped develop my analytical and problem-solving skills.</p>
          </div>
        </div>
      </div>

      {/* Download Resume CTA */}
      <div className="journey-item mt-24 border-t border-gray-200 pt-16 flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-black mb-2">Full Resume</h3>
          <p className="text-base text-gray-600">Download a comprehensive PDF version of my experience.</p>
        </div>
        <a 
          href={resumePdf}
          download="Nibir_Borkataki_Resume.pdf"
          className="flex items-center gap-2 bg-gray-100 text-black border border-gray-200 px-8 py-4 rounded font-bold uppercase text-[0.6875rem] tracking-[0.1em] hover:bg-black hover:text-white transition-colors duration-300">
          <span className="material-symbols-outlined text-lg">download</span>
          Download PDF
        </a>
      </div>
    </section>
  );
}
