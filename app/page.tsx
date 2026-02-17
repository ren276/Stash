"use client";

import Link from "next/link";
import {
  Briefcase,
  LinkIcon,
  FileText,
  FileUp,
  ArrowRight,
  Zap,
  Shield,
  Copy,
  CheckCircle2,
  Star,
  Menu,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: LinkIcon,
    title: "Smart Link Management",
    description:
      "Store your GitHub, LinkedIn, portfolio, and social profiles. Copy any URL in one click with our smart dashboard.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" // Dashboard/Analytics
  },
  {
    icon: FileText,
    title: "Instant Snippets",
    description:
      "Save text snippets — cover letter blurbs, responses, intro bios. Search and copy instantly to speed up applications.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2370&auto=format&fit=crop" // Coding/Text
  },
  {
    icon: FileUp,
    title: "Resume Versions",
    description:
      "Upload multiple resumes tailored to different roles. Preview and download securely anytime, anywhere.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2370&auto=format&fit=crop" // Documents
  },
];

const highlights = [
  {
    icon: Copy,
    title: "One-Click Copy",
    description: "Every piece of data is copyable with a single click.",
  },
  {
    icon: Zap,
    title: "Zero Friction",
    description: "Built for speed. No clutter, no unnecessary features.",
  },
  {
    icon: Shield,
    title: "Fully Secure",
    description: "Your data is private, encrypted, and never shared.",
  },
];

function ScrollReveal({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-hidden font-[family-name:var(--font-body)]">

      {/* ── Nav ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-syne)] tracking-tight text-white">
              Stash
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "About"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-lg hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#0a0a0a] border-b border-white/10 p-6 flex flex-col gap-4 animate-slide-up">
            {["Features", "About"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-lg font-medium text-white/70 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="h-px bg-white/10 my-2" />
            <Link href="/login" className="text-lg font-medium text-white/70 hover:text-white">Sign In</Link>
            <Link href="/signup" className="text-lg font-bold text-accent">Get Started</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-20 sm:pt-36 sm:pb-32 overflow-hidden bg-[#020617] text-white">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
          <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium mb-8 animate-fade-in backdrop-blur-md shadow-lg shadow-black/20">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="tracking-wide">v1.0 is live</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold font-[family-name:var(--font-syne)] leading-[1.05] mb-8 animate-slide-up tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 drop-shadow-2xl">
            Everything you need.
            <br />
            <span className="text-white/80">Right where you need it.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 animate-slide-up leading-relaxed font-light" style={{ animationDelay: "0.1s" }}>
            Stop digging through folders and bookmarks. Stash helps you organize your links,
            snippets, and documents in one beautiful, secure workspace.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              href="/signup"
              className="min-w-[180px] flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold text-lg rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
            >
              Start for free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="min-w-[180px] flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white font-medium text-lg rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm border border-white/10"
            >
              View Demo
            </Link>
          </div>

          {/* Social Proof / Ticker */}
          <div className="mt-24 pt-10 border-t border-white/5 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <p className="text-sm text-white/30 font-medium mb-8 uppercase tracking-widest">Trusted by job seekers at</p>
            <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              {/* Improved Placeholders */}
              {["Google", "Spotify", "Airbnb", "Discord", "Linear"].map(company => (
                <h3 key={company} className="text-2xl font-bold font-[family-name:var(--font-syne)] text-white hover:text-white transition-colors cursor-default">{company}</h3>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Alternating Features ── */}
      <section id="features" className="py-24 sm:py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 space-y-32">

          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-syne)] mb-6 text-white">
                Built for flow.
              </h2>
              <p className="text-xl text-white/50">
                Designed to get out of your way so you can focus on what matters.
              </p>
            </div>
          </ScrollReveal>

          {features.map((feature, idx) => (
            <ScrollReveal key={feature.title}>
              <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Text Side */}
                <div className="flex-1 space-y-8">
                  <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg shadow-accent/5 ring-1 ring-white/10`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-syne)] text-white leading-tight">
                    {feature.title}
                  </h2>
                  <p className="text-xl text-white/50 leading-relaxed max-w-lg">
                    {feature.description}
                  </p>
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    {(idx === 0
                      ? ["One-click copy", "Visual previews", "Smart categorization"]
                      : idx === 1
                        ? ["Syntax highlighting", "Quick search", "Tagging system"]
                        : ["Version control", "Secure storage", "Instant download"]
                    ).map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-white/70">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        <span className="text-base font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Side */}
                <div className="flex-1 w-full">
                  <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-500/5 border border-white/10 group">
                    {/* Gradient Overlay on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />

                    {/* Image */}
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Glass Card Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-white">Live Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Bento Grid Highlights ── */}
      <section id="about" className="py-24 sm:py-32 bg-[#020617] border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0%,transparent_70%)] opacity-50" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-syne)] mb-6 text-white">
                Why Stash?
              </h2>
              <p className="text-xl text-white/50">
                Everything you need to manage your applications efficiently, without the clutter.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item, i) => (
              <ScrollReveal key={item.title} className={`delay-${i * 100}`}>
                <div className="bg-white/5 border border-white/10 p-10 rounded-[2rem] hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-syne)] mb-4 text-white">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed text-lg">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 sm:py-40 overflow-hidden bg-[#050505]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="relative bg-[#0a0a0a] rounded-[3rem] p-12 sm:p-24 overflow-hidden text-white shadow-2xl shadow-accent/10 border border-white/10 group">
              {/* Glows */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-accent/30 transition-colors duration-1000" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2 group-hover:bg-blue-500/20 transition-colors duration-1000" />

              <h2 className="relative text-5xl sm:text-7xl font-bold font-[family-name:var(--font-syne)] mb-8 z-10 leading-tight">
                Ready to get<br />organized?
              </h2>
              <p className="relative text-xl text-white/50 mb-12 max-w-xl mx-auto z-10">
                Join thousands of users who have streamlined their digital life with Stash.
              </p>

              <Link
                href="/signup"
                className="relative inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold text-xl rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)] z-10"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-[#020617] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-[family-name:var(--font-syne)]">Stash</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-white/50 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="https://twitter.com" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="https://github.com/ren276" className="hover:text-white transition-colors">GitHub</Link>
          </div>
          <span className="text-sm text-white/30">© {new Date().getFullYear()} Stash Inc.</span>
        </div>
      </footer>
    </div>
  );
}
