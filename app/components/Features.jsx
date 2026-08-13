'use client';

import { BookOpen, FileEdit, CheckCircle2, BarChart2 } from 'lucide-react';

const featuresList = [
  {
    icon: BookOpen,
    title: "Subjects & Chapters",
    description: "Organize your syllabus into subjects and chapters so you always know what to study next."
  },
  {
    icon: FileEdit,
    title: "Learn & Take Notes",
    description: "Study structured chapter content and keep your personal notes alongside your learning."
  },
  {
    icon: CheckCircle2,
    title: "Practice & Tests",
    description: "Practice chapter questions, take tests, and see how well you actually understand the material."
  },
  {
    icon: BarChart2,
    title: "Track Your Progress",
    description: "See completed chapters, test performance, and overall study progress at a glance."
  }
];

export default function Features() {
  return (
    <section id="features" className="relative w-full bg-neutral-950 py-24 sm:py-32 border-b border-neutral-800">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16 sm:mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-3 sm:mb-4">
            Everything in One Place
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            A better way to study.
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed">
            Study OS keeps your entire study workflow organized, from learning chapters to testing your knowledge and tracking your progress.
          </p>
        </div>

        {/* 4-Card Minimal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {featuresList.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="group rounded-lg border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8 hover:bg-neutral-900 hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white mb-6 group-hover:border-neutral-600 transition-colors">
                    <IconComponent size={20} className="text-neutral-300" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-neutral-400 leading-relaxed font-normal">
                    {feature.description}
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