// components/Footer.jsx
'use client';

export default function Footer() {
  return (
    <footer className="w-full bg-[#131313] py-12 px-6 flex flex-col items-center justify-center text-center font-sans text-white space-y-[5px]">
  <div className="flex items-center space-x-8 mb-4 text-sm font-medium">
    <a href="/about" className="hover:opacity-75 transition-opacity">About</a>
    <a href="/contact" className="hover:opacity-75 transition-opacity">Contact</a>
  </div>
  <p className="text-xs text-slate-400 text-[15px]">
    &copy; 2026 Oona. All rights reserved.
  </p>
</footer>
  );
}