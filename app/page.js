import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/howitWork";
import Footer from "./components/Footer";
import ScrollReveal from "./components/ScrollReveal";

export default function Home() {
  return (
    <main className="bg-black min-h-screen text-zinc-100 selection:bg-zinc-800 selection:text-white overflow-x-hidden">
      <Navbar />
      
      {/* Hero loads immediately */}
      <Hero />
      
      {/* Features fades & slides up smoothly on scroll */}
      <ScrollReveal>
        <Features />
      </ScrollReveal>

      {/* How It Works fades & slides up smoothly on scroll */}
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      <ScrollReveal>
        <Footer />
      </ScrollReveal>
    </main>
  );
}