import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FinSenseArt, DapoonArt, FloatifyArt, FitArt } from './ProjectArt';

gsap.registerPlugin(ScrollTrigger);

// The first project is the main one: it gets a full-width card on desktop.
const FEATURED = [
  {
    title: 'FinSense AI',
    subtitle: 'AI Money Tracker',
    badge: 'Personal Project',
    description:
      'Log spending in plain language – “Spent ₹450 on dinner” – and Google Gemini turns it into categorised transactions, a clear monthly breakdown and honest insights, so you can ask things like “Can I afford a PS5 next month?” before the money leaves your account.',
    tags: ['Gemini API', 'Natural Language', 'AI Insights', 'Fintech'],
    footer: 'Fintech · Live',
    link: { href: 'https://finsense-gjis.vercel.app/', label: 'Visit FinSense' },
    Art: FinSenseArt,
    span: 'lg:col-span-12',
    wide: true,
  },
  {
    title: 'Sanskritir Dapoon',
    subtitle: 'Digital E-Newspaper',
    badge: 'Freelance Work',
    description:
      'An e-newspaper platform for a cultural organisation, with paid subscriptions through a payment gateway, SMS notifications and JWT-secured reader accounts.',
    tags: ['Payment Gateway', 'SMS API', 'JWT Auth', 'Node.js'],
    footer: 'E-publishing & media',
    link: { href: 'https://www.sanskritirdapoon.in', label: 'Visit site' },
    Art: DapoonArt,
    span: 'lg:col-span-4',
  },
  {
    title: 'Floatify',
    subtitle: 'Mutual Fund Analytics',
    badge: 'Office Work',
    description:
      'Python scrapers pull fund factsheet PDFs, scheduled cron jobs extract the data and compute CAGR, and the results are presented as clean, comparable fund insights.',
    tags: ['Python', 'Web Scraping', 'Cron Jobs', 'PDF Extraction'],
    footer: 'Fintech',
    link: { href: 'https://floatify.in', label: 'Visit site' },
    Art: FloatifyArt,
    span: 'lg:col-span-4',
  },
  {
    title: 'FitAI',
    subtitle: 'AI Fitness Coach',
    badge: 'Personal Project',
    description:
      'Now live (v1): tell it your body, goal and equipment and it gives you your numbers – BMI, daily calories, heart-rate zones – a weekly training plan written for you, and a Gemini coach you can ask anything.',
    tags: ['Gemini API', 'Training Plans', 'Health Metrics'],
    footer: 'Health tech · Live v1',
    link: { href: 'https://fit-ai-sigma-blue.vercel.app/', label: 'Visit FitAI' },
    Art: FitArt,
    span: 'lg:col-span-4',
  },
];

const MORE = [
  {
    title: 'Personal AI RAG',
    meta: 'Personal project · Ollama · Local LLM',
    summary: 'Chat with your PDFs, answered by a model running entirely on my own machine.',
    status: 'GitHub',
    href: 'https://github.com/Nibirborkataki/LocalRAG-AI',
  },
  {
    title: 'Wedding Photography',
    meta: 'Client project · Portfolio & booking',
    summary: 'A studio website with portfolio, collections and enquiries for a wedding photographer.',
    status: 'Live',
    href: 'https://weeding-photography.vercel.app/',
  },
  {
    title: 'Gym Website',
    meta: 'Personal project · Responsive web',
    summary: 'A clean, responsive website for a gym and its members – link coming soon.',
    status: 'In development',
  },
];

function Tag({ children }) {
  return (
    <span className="rounded-full bg-gray-200/70 py-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">
      {children}
    </span>
  );
}

function FeaturedCard({ project, index }) {
  const { title, subtitle, badge, description, tags, footer, link, Art, span, wide } = project;
  return (
    <article
      className={`project-card group ${span} flex flex-col ${wide ? 'lg:flex-row lg:gap-10' : ''} bg-surface-container-low border border-gray-200 p-4 md:p-5 rounded-sm transition-[box-shadow,border-color] duration-300 hover:border-gray-400 hover:shadow-xl`}
    >
      <div className={`relative overflow-hidden rounded-sm bg-black aspect-[8/5] ${wide ? 'lg:w-[58%] lg:shrink-0' : ''}`}>
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          <Art />
        </div>
        <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border border-white/20">
          {badge}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-bold tracking-widest text-white/50">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className={`flex flex-col flex-1 pt-6 px-1 md:px-2 ${wide ? 'lg:pt-4 lg:pr-4' : ''}`}>
        {wide && (
          <span className="hidden lg:inline-block self-start mb-4 text-[10px] font-bold uppercase tracking-widest text-white bg-black px-2.5 py-1">
            Featured
          </span>
        )}
        <h3 className={`${wide ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'} font-bold uppercase tracking-tight text-black leading-tight`}>
          {title}
          <span className="block text-sm md:text-base font-semibold normal-case tracking-normal text-gray-500 mt-1">
            {subtitle}
          </span>
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mt-4">{description}</p>
        <div className="flex flex-wrap gap-2 mt-5">
          {tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-4 text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-400">{footer}</span>
            {link && (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
              >
                {link.label} →
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const reveal = (targets, trigger, stagger = 0.12) =>
        gsap.fromTo(
          targets,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger,
            ease: 'power3.out',
            scrollTrigger: { trigger, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );

      reveal('.projects-header', '.projects-header');
      reveal('.project-index-item', '.project-index', 0.08);

      const cards = gsap.utils.toArray('.project-card');
      const mm = gsap.matchMedia();

      // Desktop: the wide main card fades up on its own, then the row of three.
      mm.add('(min-width: 1024px)', () => {
        reveal(cards.slice(0, 1), cards[0]);
        reveal(cards.slice(1), cards[1]);
      });

      // Mobile/tablet: a stacking deck. Each card sticks as it arrives, and the next one
      // slides up from the bottom and settles on top while the one beneath eases back.
      mm.add('(max-width: 1023px)', () => {
        const STACK_GAP = 14;
        const place = () =>
          cards.forEach((card, i) => {
            // Stick high enough that even a tall card is fully visible when it lands.
            const top = Math.min(84, window.innerHeight - card.offsetHeight - 16) + i * STACK_GAP;
            gsap.set(card, { position: 'sticky', top });
          });
        place();

        cards.slice(0, -1).forEach((card, i) => {
          const next = cards[i + 1];
          gsap.to(card, {
            // Only shrink – cards stay opaque so the stack never shows through itself.
            scale: 0.92,
            transformOrigin: 'center top',
            ease: 'none',
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: () => `top ${parseFloat(next.style.top) || 0}px`,
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          });
        });

        ScrollTrigger.addEventListener('refreshInit', place);
        return () => ScrollTrigger.removeEventListener('refreshInit', place);
      });

      gsap.utils.toArray('.project-card').forEach((card) =>
        ScrollTrigger.create({ trigger: card, start: 'top 75%', end: 'bottom 25%', toggleClass: 'is-inview' })
      );
    },
    { scope: sectionRef }
  );

  return (
    <section id="projects" ref={sectionRef} className="pt-24 md:pt-32 max-w-7xl mx-auto px-6 md:px-12 w-full">
      <header className="projects-header mb-12 md:mb-20">
        <div className="flex flex-col gap-4">
          <span className="text-[0.6875rem] uppercase tracking-[0.15em] font-semibold text-gray-500">
            Work / 04
          </span>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-black leading-[1.1]">
            Selected<br />Projects.
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mt-4 leading-relaxed">
            Personal experiments, freelance builds and production work, from local AI to fintech pipelines.
          </p>
        </div>
      </header>

      {/* One container for all cards so they can stack (sticky) on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {FEATURED.map((project, i) => (
          <FeaturedCard key={project.title} project={project} index={i} />
        ))}
      </div>

      {/* More work – compact index without images */}
      <div className="project-index mt-20 md:mt-28">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[0.6875rem] uppercase tracking-[0.15em] font-semibold text-gray-500">
              More Work
            </span>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-black mt-2">Project Index</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {String(FEATURED.length + MORE.length).padStart(2, '0')} works
          </span>
        </div>

        <ul className="border-t border-gray-200">
          {MORE.map((item, i) => {
            const Row = item.href ? 'a' : 'div';
            const linkProps = item.href ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <li key={item.title} className="project-index-item">
                <Row
                  {...linkProps}
                  className="group relative grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[3rem_1fr_1fr_auto] items-center gap-x-4 gap-y-1 border-b border-gray-200 py-6 before:bg-surface-container-low before:content-[''] before:absolute before:inset-0 before:origin-bottom before:scale-y-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:before:scale-y-100 [&>*]:relative"
                >
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 pl-1">
                    {String(FEATURED.length + i + 1).padStart(2, '0')}
                  </span>
                  <div className="transition-transform duration-300 group-hover:translate-x-1">
                    <p className="text-base md:text-lg font-bold uppercase tracking-tight text-black">{item.title}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-1">{item.meta}</p>
                  </div>
                  <p className="hidden md:block text-sm text-gray-500 md:text-right">{item.summary}</p>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest border px-2.5 py-1 transition-colors duration-300 mr-1 whitespace-nowrap ${
                      item.href
                        ? 'border-black bg-black text-white group-hover:bg-white group-hover:text-black'
                        : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {item.status}
                    {item.href && ' ↗'}
                  </span>
                </Row>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
