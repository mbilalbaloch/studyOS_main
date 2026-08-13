// app/contact/page.jsx
'use client';

import { useState } from 'react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Mail, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">

        {/* Hero Section */}
        <section className="relative w-full pt-28 pb-16 sm:pb-20 border-b border-neutral-800 overflow-hidden">
          <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            
            {/* Eyebrow */}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-6 sm:mb-8">
              Contact
            </p>

            {/* Main Headline */}
            <h1 
              className="font-bold tracking-tight text-white leading-[1.08] mb-6 sm:mb-8 max-w-[20ch] sm:max-w-xl md:max-w-2xl"
              style={{ fontSize: 'clamp(2.5rem, 7.5vw, 4.5rem)' }}
            >
              Have a question? Let&apos;s talk.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-neutral-400 font-normal leading-relaxed max-w-sm sm:max-w-md md:max-w-xl">
              Have feedback, found an issue, or simply want to get in touch? Send us a message and we&apos;ll get back to you.
            </p>

          </div>
        </section>

        {/* Contact Form Section */}
        <section className="relative w-full py-20 sm:py-28 border-b border-neutral-800">
          <div className="mx-auto max-w-xl px-5 sm:px-6 lg:px-8">
            
            {submitted ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-8 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Message sent successfully</h3>
                <p className="text-sm text-neutral-400">
                  Thank you for reaching out. We will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
                
                {/* Name Field */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors min-h-[48px]"
                    placeholder="Your name"
                  />
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors min-h-[48px]"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Message Field */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-medium text-neutral-950 hover:bg-neutral-200 transition-colors shadow-sm active:scale-[0.98] min-h-[48px] mt-2"
                >
                  <Send size={16} />
                  Send Message
                </button>

              </form>
            )}

            {/* Alternative Contact */}
            <div className="mt-12 text-center flex flex-col items-center gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                Prefer email?
              </p>
              <a
                href="mailto:hello@studyos.app"
                className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
              >
                <Mail size={16} className="text-neutral-400" />
                hello@studyos.app
              </a>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}