import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import UTCClock from "./UTCClock";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navLinks = [
    { name: "SYSTEMS",  path: "/systems" },
    { name: "FILES",    path: "/files" },
    { name: "DOSSIERS", path: "/dossiers" },
    { name: "WORLD",    path: "/world" },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 relative overflow-hidden flex flex-col">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(transparent_95%,rgba(16,185,129,0.35)_100%)] bg-[length:100%_4px] z-50" />

      <div className="mx-auto w-full max-w-7xl px-6 py-5 relative z-10 flex flex-col flex-1">

        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">

          <Link href="/" className="flex items-center gap-4 group">
            <img
              src="/logo.png"
              alt="RSR Intelligence Network"
              className="h-14 w-auto object-contain opacity-75 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div>
              <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-400 leading-none mb-1">
                RSR INTELLIGENCE NETWORK
              </div>
              <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-600 uppercase">
                INDEPENDENT ANALYSIS SYSTEM
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <UTCClock />
            <nav className="flex gap-1.5 font-mono text-[10px] tracking-[0.35em]">
              {navLinks.map((link) => {
                const isActive =
                  location === link.path ||
                  (link.path !== "/" && location.startsWith(link.path));
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`px-3 py-2 border transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/5"
                        : "border-zinc-900 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

        </header>

        <main className="flex-1 py-8">{children}</main>

        <footer className="border-t border-zinc-900 pt-4 pb-2 flex justify-between items-center font-mono text-[10px] tracking-[0.35em] text-zinc-700">
          <div>RSR // INTELLIGENCE NETWORK</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
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
