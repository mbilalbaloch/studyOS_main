// app/about/page.jsx
'use client';

import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import ScrollReveal from '@/app/components/ScrollReveal';

const coreCapabilities = [
  "Organize subjects and chapters",
  "Study structured chapter content",
  "Take personal notes",
  "Practice questions",
  "Take tests",
  "Track their progress",
  "Identify what they should focus on next"
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans selection:bg-neutral-800 selection:text-white overflow-x-hidden">
      
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">

        {/* Hero Section */}
        <section className="relative w-full pt-28 pb-20 sm:pb-28 md:pb-36 border-b border-neutral-800 overflow-hidden">
          <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            
            {/* Eyebrow */}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-6 sm:mb-8">
              About Study OS
            </p>

            {/* Main Headline */}
            <h1 
              className="font-bold tracking-tight text-white leading-[1.08] mb-6 sm:mb-8 max-w-[20ch] sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
              style={{ fontSize: 'clamp(2.5rem, 7.5vw, 4.5rem)' }}
            >
              A simpler way to take control of your studies.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-neutral-400 font-normal leading-relaxed max-w-sm sm:max-w-md md:max-w-xl">
              Study OS is a focused study workspace built to help students organize what they need to learn, stay consistent, and clearly see their progress.
            </p>

          </div>
        </section>

        {/* What is Study OS? Section */}
        <ScrollReveal>
          <section className="relative w-full py-24 sm:py-32 border-b border-neutral-800">
            <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
              
              <div className="max-w-2xl mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">
                  What is Study OS?
                </h2>
                <p className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed">
                  Study OS brings the important parts of studying into one organized workspace. Instead of jumping between notes, chapter lists, practice questions, and test results, everything is connected in one place.
                </p>
              </div>

              {/* Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {coreCapabilities.map((item, index) => (
                  <div 
                    key={index}
                    className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 sm:p-5 flex items-center gap-3 text-sm text-neutral-300 font-medium"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

            </div>
          </section>
        </ScrollReveal>

        {/* Why We Built It Section */}
        <ScrollReveal>
          <section className="relative w-full py-24 sm:py-32 border-b border-neutral-800">
            <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
              
              <div className="max-w-2xl mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">
                  Built around the way students actually study.
                </h2>
                <p className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed">
                  Studying can become messy when your syllabus, notes, practice, and progress are scattered across different places. Study OS is designed to make that process simpler — giving students one clear place to learn, practice, and keep moving forward.
                </p>
              </div>

            </div>
          </section>
        </ScrollReveal>

        {/* Core Idea Flow Section */}
        <ScrollReveal>
          <section className="relative w-full py-24 sm:py-32 border-b border-neutral-800">
            <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8 text-center">
              
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-8 sm:mb-12">
                Core Workflow
              </h3>

              {/* Flow Representation */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
                <div className="w-full md:w-auto px-6 py-4 rounded-lg border border-neutral-800 bg-neutral-900/50 text-sm font-semibold text-white">
                  Learn
                </div>
                <div className="text-neutral-600 hidden md:block">→</div>
                <div className="w-full md:w-auto px-6 py-4 rounded-lg border border-neutral-800 bg-neutral-900/50 text-sm font-semibold text-white">
                  Practice
                </div>
                <div className="text-neutral-600 hidden md:block">→</div>
                <div className="w-full md:w-auto px-6 py-4 rounded-lg border border-neutral-800 bg-neutral-900/50 text-sm font-semibold text-white">
                  Test
                </div>
                <div className="text-neutral-600 hidden md:block">→</div>
                <div className="w-full md:w-auto px-6 py-4 rounded-lg border border-neutral-800 bg-neutral-900/50 text-sm font-semibold text-white">
                  Improve
                </div>
              </div>

              <p className="text-sm text-neutral-400 font-normal">
                One continuous study workflow.
              </p>

            </div>
          </section>
        </ScrollReveal>

        {/* Final CTA Section */}
        <ScrollReveal>
          <section className="relative w-full py-24 sm:py-32">
            <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8 text-center flex flex-col items-center">
              
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                Make your study routine simpler.
              </h2>
              <p className="text-base sm:text-lg text-neutral-400 font-normal max-w-md mb-8">
                Everything you need to stay organized and keep making progress, in one place.
              </p>

              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-white px-7 py-3.5 text-sm font-medium text-neutral-950 hover:bg-neutral-200 transition-colors shadow-sm active:scale-[0.98]"
              >
                Get Started
              </Link>

            </div>
          </section>
        </ScrollReveal>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}