import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import UTCClock from "./UTCClock";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navLinks = [
    { name: "HOME",     path: "/" },
    { name: "SYSTEMS",  path: "/systems" },
    { name: "FILES",    path: "/files" },
    { name: "DOSSIERS", path: "/dossiers" },
    { name: "WORLD",    path: "/world" },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 relative flex flex-col">
      {/* Scanline overlay — barely visible, purely textural */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025] bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.3)_3px,rgba(0,0,0,0.3)_4px)] z-50" />

      <div className="mx-auto w-full max-w-7xl px-6 py-5 relative z-10 flex flex-col flex-1">

        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">

          {/* Brand — logo is the dominant system emblem */}
          <Link href="/" className="flex items-center gap-5 group">
            <img
              src="/logo.png"
              alt="RSR Intelligence Network"
              className="h-20 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="flex flex-col gap-1">
              <div className="font-mono text-[11px] tracking-[0.45em] text-emerald-400 leading-none">
                RSR INTELLIGENCE NETWORK
              </div>
              <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-700 uppercase">
                INDEPENDENT ANALYSIS SYSTEM
              </div>
            </div>
          </Link>

          {/* Right side: clock + nav */}
          <div className="flex items-center gap-3">
            <UTCClock />
            <nav className="flex gap-1 font-mono text-[11px] tracking-[0.3em]">
              {navLinks.map((link) => {
                const isActive =
                  link.path === "/"
                    ? location === "/"
                    : location === link.path || location.startsWith(link.path);
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`px-3 py-2 border transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/5"
                        : "border-transparent text-zinc-600 hover:text-zinc-200 hover:border-zinc-800"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

        </header>

        <main className="flex-1 py-10">{children}</main>

        <footer className="border-t border-zinc-900 pt-4 pb-2 flex justify-between items-center font-mono text-[10px] tracking-[0.35em] text-zinc-800">
          <div>RSR // INTELLIGENCE NETWORK</div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
              SECURE CONNECTION
            </span>
            <span className="hidden sm:inline">V 2.4.9</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
