import React from "react";
import { Link, useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navLinks = [
    { name: "SYSTEMS", path: "/systems" },
    { name: "FILES", path: "/files" },
    { name: "DOSSIERS", path: "/dossiers" },
    { name: "WORLD", path: "/world" },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 relative overflow-hidden flex flex-col">
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[linear-gradient(transparent_95%,rgba(16,185,129,0.4)_100%)] bg-[length:100%_4px] z-50" />

      <div className="mx-auto w-full max-w-7xl px-6 py-6 relative z-10 flex flex-col flex-1">
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-emerald-500/10 pb-5 gap-4">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="h-14 w-14 rounded-full border border-emerald-500/20 bg-black flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)] group-hover:border-emerald-500/50 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] transition-all duration-300">
              <img
                src="/logo.png"
                alt="RSR"
                className="h-[90%] w-[90%] object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400">RSR INTELLIGENCE NETWORK</div>
              <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">INDEPENDENT ANALYSIS SYSTEM</div>
            </div>
          </Link>

          <nav className="flex gap-2 font-mono text-[10px] tracking-[0.35em] overflow-x-auto pb-2 md:pb-0">
            {navLinks.map((link) => {
              const isActive = location === link.path || (link.path !== '/' && location.startsWith(link.path));
              return (
                <Link key={link.name} href={link.path} className={`px-3 py-2 border transition-colors whitespace-nowrap ${
                  isActive 
                    ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "border-zinc-800 bg-black text-zinc-500 hover:text-emerald-300 hover:border-emerald-500/30"
                }`}>
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 py-8">
          {children}
        </main>

        <footer className="mt-auto border-t border-zinc-900 pt-6 pb-2 flex justify-between items-center text-[10px] font-mono tracking-[0.4em] text-zinc-600">
          <div>RSR // INTELLIGENCE NETWORK</div>
          <div className="flex gap-4">
            <span>SECURE CONNECTION</span>
            <span className="text-emerald-500/50 hidden sm:inline">V_2.4.9</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
