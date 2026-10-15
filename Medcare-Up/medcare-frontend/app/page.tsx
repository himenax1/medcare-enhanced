"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// 🎬 OPTIMIZED SCROLL REVEAL COMPONENT
function RevealText({ 
  children, 
  delay = 0, 
  className = "" 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string; 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Trigger වූ පසු observer එකෙන් ඉවත් කර සුමටව තබා ගනී
        }
      },
      { 
        threshold: 0.15, 
        rootMargin: "0px 0px -20px 0px" 
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
        isVisible 
          ? "opacity-100 translate-y-0 scale-100 blur-none" 
          : "opacity-0 translate-y-12 scale-[0.98] blur-[2px]"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function MedCareCinematicPage() {
  const [scrollPos, setScrollPos] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          setScrollPos(currentScroll);

          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const pct = maxScroll > 0 ? Math.min(Math.max(currentScroll / maxScroll, 0), 1) : 0;
          setScrollPercent(pct);

          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouse = (e: MouseEvent) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth - 0.5) * 30, 
        y: (e.clientY / window.innerHeight - 0.5) * 30 
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouse, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <div className="relative bg-[#020407] text-[#F4F7F8] font-sans selection:bg-[#4DE8E0]/20 min-h-screen">
      
      {/* 🌌 AMBIENT BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-screen"></div>
        
        <div 
          className="absolute rounded-full mix-blend-screen transition-transform duration-700 ease-out"
          style={{ 
            width: `${40 + (scrollPercent * 50)}vw`,
            height: `${40 + (scrollPercent * 50)}vw`,
            background: 'radial-gradient(circle, rgba(77,141,255,0.08) 0%, rgba(77,232,224,0.03) 40%, transparent 70%)',
            transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
            filter: `blur(${60 + (scrollPercent * 30)}px)`,
            opacity: Math.max(0, 1 - (scrollPercent * 0.6)) 
          }}
        ></div>
      </div>

      {/* 🧭 FIXED NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 px-8 md:px-12 py-6 flex justify-between items-center transition-all duration-500 ${
        scrollPos > 40 ? 'bg-[#020407]/80 backdrop-blur-xl py-4 border-b border-white/[0.05]' : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4DE8E0] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4DE8E0]"></span>
          </div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#F4F7F8] uppercase">MedCare</span>
        </div>
        
        <div className="flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] text-[#7E8A94] uppercase">
          <Link href="/login" className="hover:text-[#F4F7F8] transition-colors">Login</Link>
          <Link href="/register" className="text-[#4DE8E0] hover:text-[#F4F7F8] transition-colors relative group">
            Register
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#4DE8E0] transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* 🎬 SCENE 01: HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative pt-20">
          <div className="relative z-30 pb-16">
            <RevealText delay={100}>
              <h1 className="text-5xl md:text-8xl lg:text-[120px] font-medium tracking-tighter text-[#F4F7F8] leading-none mb-3">
                YOUR HEALTH.
              </h1>
            </RevealText>
            
            <RevealText delay={300}>
              <h1 className="text-5xl md:text-8xl lg:text-[120px] font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#4DE8E0] to-[#4D8DFF] leading-none mb-8">
                IN MOTION.
              </h1>
            </RevealText>

            <RevealText delay={500}>
              <p className="text-xs md:text-sm text-[#7E8A94] font-light tracking-widest max-w-md mx-auto uppercase">
                A Living Digital Space For Your Care.
              </p>
            </RevealText>
          </div>

          {/* HOLOGRAPHIC ELEMENT */}
          <div className="h-[140px] w-[140px] overflow-hidden z-20 flex flex-col items-center justify-end pointer-events-none mt-4">
            <div className="relative flex flex-col items-center z-10 w-full animate-elevatorDescend">
              <div className="animate-pulseFloating">
                <svg viewBox="0 0 80 80" className="w-[50px] h-[50px] drop-shadow-[0_0_12px_rgba(77,232,224,0.6)]">
                  <path d="M 25 20 C 25 50 55 50 55 20" fill="none" stroke="#4DE8E0" strokeWidth="3" strokeLinecap="round" />
                  <line x1="40" y1="42" x2="40" y2="60" stroke="#4D8DFF" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="40" cy="63" r="6" fill="#F4F7F8" stroke="#4DE8E0" strokeWidth="2" />
                  <circle cx="40" cy="35" r="3" fill="#4DE8E0" className="animate-ping" />
                </svg>
              </div>
              <div className="w-[70px] h-[2px] bg-[#4DE8E0] mt-2 rounded-full shadow-[0_0_15px_#4DE8E0]"></div>
            </div>
          </div>
        </section>

        {/* 🎬 SCENE 02: THE AWAKENING */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center relative">
          <div className="space-y-24 md:space-y-36 w-full max-w-5xl">
            <RevealText>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-[#F4F7F8]">
                BEYOND RECORDS.
              </h2>
            </RevealText>
            
            <RevealText delay={150}>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-light italic tracking-tight text-[#7E8A94]">
                BEYOND APPOINTMENTS.
              </h2>
            </RevealText>

            <RevealText delay={250}>
              <div className="w-full flex justify-center">
                <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#4DE8E0]/40 to-transparent"></div>
              </div>
            </RevealText>
          </div>
        </section>

        {/* 🎬 SCENE 03: THE ESSENCE */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <RevealText>
              <p className="text-[11px] font-mono tracking-[0.4em] text-[#4D8DFF] uppercase mb-4">
                The Core Philosophy
              </p>
            </RevealText>

            <RevealText delay={150}>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tighter text-[#F4F7F8] leading-[1.2]">
                EVERYTHING
                <span className="block mt-2 font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#F4F7F8] to-[#7E8A94]">
                  CONNECTED.
                </span>
              </h2>
            </RevealText>

            <RevealText delay={250}>
              <p className="text-sm md:text-base text-[#7E8A94] font-light tracking-wide max-w-xl mx-auto leading-relaxed">
                Step into a unified ecosystem where your history, laboratory diagnostics, and clinical prescriptions flow seamlessly into one secure sanctuary.
              </p>
            </RevealText>
          </div>
        </section>

        {/* 🎬 SCENE 04: THE CLIMAX */}
        <section className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden bg-black">
          <div 
            className="absolute inset-0 z-0 transition-opacity duration-1000 flex items-center justify-center pointer-events-none"
            style={{ opacity: scrollPercent > 0.75 ? 1 : 0 }}
          >
            <div className="w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(77,232,224,0.12)_0%,rgba(77,141,255,0.04)_40%,transparent_70%)] rounded-full blur-[50px]"></div>
          </div>

          <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
            <RevealText>
              <p className="text-[11px] font-mono tracking-[0.5em] text-[#7E8A94] uppercase mb-8">
                Your Sanctuary Awaits
              </p>
            </RevealText>

            <RevealText delay={150}>
              <h2 className="text-5xl md:text-8xl font-medium tracking-tighter text-[#F4F7F8] leading-none mb-6">
                ENTER THE<br/>
                <span className="italic font-light text-[#4DE8E0]">NEW ERA.</span>
              </h2>
            </RevealText>
            
            <RevealText delay={300}>
              <div className="mt-12 group relative inline-block">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#4DE8E0] to-[#4D8DFF] rounded-full blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500"></div>
                
                <Link 
                  href="/register" 
                  className="relative flex items-center gap-3 bg-[#F4F7F8] text-[#020407] px-10 py-4 rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-transform duration-300 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </Link>
              </div>
            </RevealText>

            <RevealText delay={400}>
              <div className="mt-12 flex justify-center items-center gap-6 text-[10px] font-mono tracking-[0.3em] text-[#7E8A94]/60 uppercase">
                <span>Secure</span>
                <span className="w-1 h-1 rounded-full bg-[#7E8A94]/30"></span>
                <span>Private</span>
                <span className="w-1 h-1 rounded-full bg-[#7E8A94]/30"></span>
                <span>Human</span>
              </div>
            </RevealText>
          </div>
        </section>

      </main>

      <style jsx global>{`
        @keyframes pulseFloating {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
        }
        .animate-pulseFloating { 
          animation: pulseFloating 3s ease-in-out infinite; 
        }

        @keyframes elevatorDescend {
          0%, 60% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(80px); opacity: 0; filter: blur(3px); }
          81%, 100% { transform: translateY(80px); opacity: 0; }
        }
        .animate-elevatorDescend { 
          animation: elevatorDescend 10s cubic-bezier(0.4, 0, 0.2, 1) infinite; 
        }
      `}</style>

    </div>
  );
}