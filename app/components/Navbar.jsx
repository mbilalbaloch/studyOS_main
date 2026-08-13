'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-900 text-white font-semibold text-sm">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            STUDY OS
          </span>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-600">
          <Link href="/#features" className="hover:text-neutral-900 transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-neutral-900 transition-colors">How it Works</Link>
          <Link href="/about" className="hover:text-neutral-900 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-neutral-900 transition-colors">Contact</Link>
        </nav>

        {/* Right side: Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors px-3 py-1.5"
          >
            Log in
          </Link>
          <Link 
            href="/signup" 
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Animated Icon Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-md hover:bg-neutral-100 transition-colors"
          aria-label="Toggle Menu"
        >
          <span className={`w-5 h-0.5 bg-neutral-900 rounded-full transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-neutral-900 rounded-full transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-neutral-900 rounded-full transition-all duration-300 ease-in-out ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

      </div>

      {/* Mobile Menu Dropdown with Smooth Height/Opacity Transition */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-neutral-200 bg-white ${mobileMenuOpen ? 'max-h-96 opacity-100 py-4 px-6' : 'max-h-0 opacity-0 py-0 px-6 border-b-0'}`}>
        <nav className="flex flex-col space-y-3 text-sm text-neutral-600">
          <Link 
            href="/#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-neutral-900 transition-colors py-1"
          >
            Features
          </Link>
          <Link 
            href="/#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-neutral-900 transition-colors py-1"
          >
            How it Works
          </Link>
          <Link 
            href="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-neutral-900 transition-colors py-1"
          >
            About
          </Link>
          <Link 
            href="/contact" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-neutral-900 transition-colors py-1"
          >
            Contact
          </Link>
        </nav>
        <div className="pt-4 mt-4 border-t border-neutral-100 flex flex-col gap-2">
          <Link 
            href="/login" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-center text-sm text-neutral-600 hover:text-neutral-950 py-2"
          >
            Log in
          </Link>
          <Link 
            href="/signup" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-center rounded bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}