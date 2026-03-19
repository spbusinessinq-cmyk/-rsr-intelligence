import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import UTCClock from "./UTCClock";
import BlackdogBadge from "./BlackdogBadge";
import { useAuth } from "@/lib/auth";
import { InboxPanel } from "@/components/InboxPanel";
import { useInboxCount } from "@/components/useInboxCount";
import { useInboxNav } from "@/lib/inboxNav";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user: authUser, signOut } = useAuth();
  const inboxUnread = useInboxCount(authUser?.id ?? null);
  const [inboxOpen,   setInboxOpen]   = useState(false);
  const [signingOut,  setSigningOut]  = useState(false);
  const { clearInboxNav } = useInboxNav();

  async function handleSignOut() {
    setSigningOut(true);
    clearInboxNav();
    await signOut();
    setLocation("/access");
    setSigningOut(false);
  }

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

      {/* Global inbox panel */}
      {inboxOpen && authUser && (
        <InboxPanel
          userId={authUser.id}
          onUnreadChange={() => {}}
          onClose={() => setInboxOpen(false)}
        />
      )}

      <div className="mx-auto w-full max-w-7xl px-6 py-5 relative z-10 flex flex-col flex-1">

        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 gap-4">

          {/* Brand — logo is the dominant system emblem */}
          <Link href="/" className="flex items-center gap-4 group shrink-0">
            <img
              src="/logo.png"
              alt="RSR Intelligence Network"
              className="h-16 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="flex flex-col gap-1">
              <div className="font-mono text-[11px] tracking-[0.35em] text-emerald-400 leading-none whitespace-nowrap">
                RSR INTELLIGENCE NETWORK
              </div>
              <div className="font-mono text-[10px] tracking-[0.28em] text-zinc-700 uppercase whitespace-nowrap">
                INDEPENDENT ANALYSIS SYSTEM
              </div>
            </div>
          </Link>

          {/* Right side: blackdog badge + clock + nav + inbox */}
          <div className="flex items-center gap-3">
            <BlackdogBadge />
            <UTCClock />
            <nav className="flex gap-1 font-mono text-[12px] tracking-[0.25em]">
              {navLinks.map((link) => {
                const isActive =
                  link.path === "/"
                    ? location === "/"
                    : location === link.path || location.startsWith(link.path);
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={clearInboxNav}
                    className={`px-3 py-2 border transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/5"
                        : "border-transparent text-zinc-500 hover:text-zinc-100 hover:border-zinc-800"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Inbox + Sign-out — only when logged in */}
            {authUser && (
              <>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setInboxOpen(true)}
                  onKeyDown={e => e.key === "Enter" && setInboxOpen(true)}
                  className="relative cursor-pointer group ml-1"
                  title="Open inbox"
                  aria-label="Open notifications inbox"
                >
                  <div className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 group-hover:text-zinc-200 border border-zinc-900 group-hover:border-zinc-700 px-3 py-2 transition-all duration-150 whitespace-nowrap">
                    INBOX
                  </div>
                  {inboxUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-amber-500 flex items-center justify-center font-mono text-[8px] text-black font-bold px-0.5 leading-none">
                      {inboxUnread > 9 ? "9+" : inboxUnread}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="font-mono text-[11px] tracking-[0.22em] text-zinc-600 hover:text-red-400 border border-transparent hover:border-red-900/50 px-3 py-2 transition-all duration-150 whitespace-nowrap disabled:opacity-40 ml-1"
                >
                  {signingOut ? "..." : "SIGN OUT"}
                </button>
              </>
            )}
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
