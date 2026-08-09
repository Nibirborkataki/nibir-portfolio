import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import emailjs from '@emailjs/browser';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      // Header Animation
      gsap.fromTo(
        '.contact-header',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            gsap.set('.contact-header', { clearProps: 'all' });
          },
        }
      );

      // Form Animation
      gsap.fromTo(
        '.contact-form-block',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-form-block',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            gsap.set('.contact-form-block', { clearProps: 'all' });
          },
        }
      );

      // Aside Animation
      gsap.fromTo(
        '.contact-aside',
        { y: 40, scale: 0.97, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-aside',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          onComplete: () => {
            gsap.set('.contact-aside', { clearProps: 'all' });
          },
        }
      );
    },
    {
      scope: sectionRef,
    }
  );

  // EmailJS Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sending) return;

    setSending(true);

    try {
      const result = await emailjs.send(
        'service_25nku39',
        'template_60ldl35',
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
        'GcHDSKZ1jSNIRhcCz'
      );

      console.log('Email sent successfully:', result.text);

      setSubmitted(true);

      // Clear form
      setFormData({
        name: '',
        email: '',
        message: '',
      });

      // Reset success message
      setTimeout(() => {
        setSubmitted(false);
      }, 4000);

    } catch (error) {
      console.error('EmailJS Error:', error);

      alert(
        'Unable to send your enquiry. Please try again later.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-16 md:pb-24"
    >
      {/* Header Section */}
      <div className="contact-header mb-20">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-6">
          Connect / 04
        </p>

        <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
          LET'S DEFINE THE
          <br />
          <span className="font-light italic">
            NEXT ARCHIVE.
          </span>
        </h2>

        <p className="mt-8 max-w-2xl text-neutral-600 text-base md:text-lg leading-relaxed font-light">
          Currently open for select freelance collaborations and editorial
          consulting. Based in the digital ether, reaching across time zones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

        {/* Contact Form Section */}
        <section className="contact-form-block lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="space-y-12"
          >

            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

              {/* Name */}
              <div className="relative group">
                <label className="block text-[0.6875rem] uppercase tracking-[0.05em] font-bold mb-2 text-gray-500">
                  01 / Full Name
                </label>

                <input
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-gray-300 focus:border-black focus:ring-0 px-0 py-4 transition-colors placeholder:text-gray-400 text-lg uppercase tracking-tight outline-none"
                  placeholder="ALEXANDER VESTIGE"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <label className="block text-[0.6875rem] uppercase tracking-[0.05em] font-bold mb-2 text-gray-500">
                  02 / Email Address
                </label>

                <input
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-gray-300 focus:border-black focus:ring-0 px-0 py-4 transition-colors placeholder:text-gray-400 text-lg uppercase tracking-tight outline-none"
                  placeholder="STUDIO@CURATOR.IO"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            {/* Message */}
            <div className="relative group">
              <label className="block text-[0.6875rem] uppercase tracking-[0.05em] font-bold mb-2 text-gray-500">
                03 / The Message
              </label>

              <textarea
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-gray-300 focus:border-black focus:ring-0 px-0 py-4 transition-colors placeholder:text-gray-400 text-lg uppercase tracking-tight resize-none outline-none"
                placeholder="DESCRIBE THE VISION..."
                rows={4}
                required
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value,
                  })
                }
              />
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <button
                type="submit"
                disabled={sending}
                className={`group flex items-center gap-3 bg-black text-white px-10 py-5 transition-all duration-300 hover:bg-gray-900 hover:pr-12 shadow-md ${sending
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer'
                  }`}
              >
                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.1em]">
                  {sending
                    ? 'TRANSMITTING...'
                    : submitted
                      ? 'ENQUIRY TRANSMITTED'
                      : 'TRANSMIT ENQUIRY'}
                </span>

                <span className="flex items-center justify-center w-7 h-7 border border-white transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h14M13 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </button>
            </div>

          </form>
        </section>

        {/* Metadata & Socials Section */}
        <aside className="contact-aside lg:col-span-4 lg:col-start-9 space-y-24">

          {/* Branding Image */}
          <div className="aspect-[4/5] bg-gray-100 overflow-hidden group">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Monochrome aesthetic photography"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqXi7JqaNzELqss0gBpaS7gouDJJrihxrUKqQaC_-Oyl5ptJ_SFdgAYG9PIGKGL-3dU0xG8g4iQap-0Huim29kiFQISt3W8ZgoCxWouv7SB9SEzRNg0mbyY9eof7KwjOGEqV0bNSqijFsgPCFdQKGXqlBF9iOK5-775b_WqGTxCu27s17SpSI7KCrVRDpuOd3kjJE4Gz085O8wtsX5AbVGajUXNogCUoMBoglhyIIsEva-JV5eRLPGycpS1Q_THbk9ogjuxXxrC4-c"
            />
          </div>

          {/* Connect Links */}
          <div className="space-y-12">

            {/* Digital Channels */}
            <div>
              <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] mb-6 opacity-40">
                DIGITAL CHANNELS
              </h3>

              <div className="flex flex-col gap-4">

                <a
                  className="group flex justify-between items-center py-4 border-b border-gray-200 hover:border-black transition-colors"
                  href="https://www.linkedin.com/in/nibir-borkataki-a39919254/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-sm font-semibold tracking-wide">
                    LINKEDIN
                  </span>

                  <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                    north_east
                  </span>
                </a>

                <a
                  className="group flex justify-between items-center py-4 border-b border-gray-200 hover:border-black transition-colors"
                  href="https://github.com/nibirborkataki"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-sm font-semibold tracking-wide">
                    GITHUB
                  </span>

                  <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                    north_east
                  </span>
                </a>

              </div>
            </div>

            {/* Direct Contact */}
            <div>
              <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] mb-6 opacity-40">
                DIRECT CONTACT
              </h3>

              <p className="text-sm tracking-tight font-medium text-black">
                nibirborkataki2015@gmail.com
              </p>

              <p className="text-sm tracking-tight font-medium text-black mt-1">
                +91 8822546375
              </p>
            </div>

          </div>
        </aside>
      </div>
    </section>
  );
}