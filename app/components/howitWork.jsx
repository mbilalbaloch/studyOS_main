// components/HowItWorks.jsx
'use client';

import { BookOpen, FileText, CheckCircle2, TrendingUp } from 'lucide-react';

const stepsList = [
  {
    number: "01",
    icon: BookOpen,
    title: "Choose a Subject",
    description: "Pick the subject you want to study and see its chapters in one organized place."
  },
  {
    number: "02",
    icon: FileText,
    title: "Learn the Chapter",
    description: "Open a chapter, study the content, and write your own notes as you learn."
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Practice & Test Yourself",
    description: "Practice questions and take tests to check your understanding."
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "See what you've completed, review your performance, and know what to focus on next."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative w-full bg-neutral-950 py-24 sm:py-32 border-b border-neutral-800">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16 sm:mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-3 sm:mb-4">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            Your study routine, simplified.
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed">
            Study OS turns your syllabus into a simple workflow you can follow every day.
          </p>
        </div>

        {/* 4-Step Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 relative">
          
          {stepsList.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={index}
                className="flex flex-col justify-between rounded-lg border border-neutral-800 bg-neutral-900/50 p-6 sm:p-7 relative"
              >
                <div>
                  {/* Top Bar: Number & Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-neutral-600 tracking-tight">
                      {step.number}
                    </span>
                    <div className="w-9 h-9 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
                      <IconComponent size={18} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2 tracking-tight">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}