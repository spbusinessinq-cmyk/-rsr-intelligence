import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isConfigured } from "./supabase";

export interface Profile {
  id: string;
  handle: string;
  title?: string;
  requested_role?: string;
  role: string;
  approval_status: string;
  account_status?: string;
  created_at?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, handle: string, requestedRole?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* ── Profile loader (never throws, never hangs the auth gate) ─────────── */
async function loadProfileSafe(
  userId: string,
  userEmail: string | undefined,
  setProfile: (p: Profile | null) => void
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data && !error) {
      setProfile(data as Profile);
      return;
    }

    // Profile row missing — create a default one
    const handle = (userEmail ?? "operator")
      .split("@")[0]
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "-")
      .slice(0, 24);

    await supabase.from("profiles").upsert(
      {
        id: userId,
        email: userEmail ?? "",
        handle,
        role: "member",
        approval_status: "pending",
        account_status: "active",
      },
      { onConflict: "id" }
    );
    setProfile({
      id: userId,
      handle,
      role: "member",
      approval_status: "pending",
      account_status: "active",
      email: userEmail ?? "",
    });
  } catch (err) {
    console.warn("[auth] profile load error:", err);
    // Don't throw — caller continues without profile
  }
}

/* ── AuthProvider ─────────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      console.log("[auth] Supabase not configured");
      setLoading(false);
      return;
    }

    console.log("[auth] boot start");
    let settled = false;

    function settle(reason: string) {
      if (!settled) {
        settled = true;
        console.log("[auth] settled →", reason);
        setLoading(false);
      }
    }

    /* Hard guarantee — loading resolves within 5 s no matter what */
    const timer = setTimeout(() => {
      settle("5 s timeout");
    }, 5000);

    /*
     * onAuthStateChange is the authoritative source of truth.
     * In Supabase v2, INITIAL_SESSION fires synchronously after subscription.
     * We settle loading as soon as we know the auth state (before profile loads).
     * Profile loads asynchronously and updates state after — no blocking.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        console.log("[auth] event:", event, s ? s.user.email : "no session");

        setSession(s);
        setUser(s?.user ?? null);

        if (!s?.user) {
          setProfile(null);
        }

        /*
         * Settle immediately on any event that represents a definitive state.
         * We don't await profile here — profile loads in background and
         * updates state independently, which causes a second render.
         * This keeps the loading gate fast.
         */
        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN"       ||
          event === "SIGNED_OUT"      ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          clearTimeout(timer);
          settle(event);
        }

        /* Kick off profile load in the background (non-blocking) */
        if (s?.user) {
          loadProfileSafe(s.user.id, s.user.email, setProfile);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, handle: string, requestedRole = "member") {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        handle: handle.toUpperCase().replace(/[^A-Z0-9-]/g, "-"),
        role: "member",
        approval_status: "pending",
        requested_role: requestedRole,
      });
    }
    return { error: null };
  }

  async function signOut() {
    console.log("[auth] signing out");
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, configured: isConfigured, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/* ── Session recovery helper (exported for use anywhere) ─────────────── */
export async function clearSession(): Promise<void> {
  try {
    // Local-only sign-out — doesn't need network, works even with stale tokens
    await supabase.auth.signOut({ scope: "local" });
  } catch {}
  // Wipe all Supabase auth keys from localStorage
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("sb-")) localStorage.removeItem(k);
    });
  } catch {}
}

/* ── Screens ─────────────────────────────────────────────────────────── */

/**
 * Shown during auth boot. After 3 s with no resolution, automatically
 * switches to the recovery UI (retry / clear session). The auth provider's
 * own 5 s timeout ensures loading eventually resolves regardless.
 */
function VerifyingScreen() {
  const [showRecovery, setShowRecovery] = useState(false);
  const [clearing,     setClearing]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowRecovery(true), 3000);
    return () => clearTimeout(t);
  }, []);

  async function handleClear() {
    setClearing(true);
    await clearSession();
    // Hard reload to clean page state completely
    const base = window.location.href.split("#")[0];
    window.location.replace(base + "#/access");
  }

  function handleRetry() {
    window.location.reload();
  }

  if (showRecovery) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-xs w-full px-6 text-center space-y-6">
          <div className="space-y-2">
            <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-600">
              SESSION CHECK DELAYED
            </div>
            <div className="w-20 h-px bg-zinc-900 mx-auto" />
            <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-800 leading-relaxed">
              Authentication is taking longer than expected.
              <br />Select an option below.
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full font-mono text-[10px] tracking-[0.3em] text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200 px-4 py-3 transition-all duration-150"
            >
              RETRY SESSION
            </button>

            <button
              onClick={handleClear}
              disabled={clearing}
              className="w-full font-mono text-[10px] tracking-[0.3em] text-emerald-600 border border-emerald-900/50 hover:border-emerald-700 hover:text-emerald-400 px-4 py-3 transition-all duration-150 disabled:opacity-40"
            >
              {clearing ? "CLEARING..." : "CLEAR SESSION + SIGN IN"}
            </button>
          </div>

          <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-800">
            RSR INTELLIGENCE NETWORK
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-700 animate-pulse">
          VERIFYING CREDENTIALS...
        </div>
        <div className="w-32 h-px bg-zinc-900 mx-auto" />
        <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-800">
          RSR INTELLIGENCE NETWORK
        </div>
      </div>
    </div>
  );
}

function PendingScreen({ profile }: { profile: Profile }) {
  const { signOut } = useAuth();
  const joined = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
    : "UNKNOWN";

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
          </div>
          <div>
            <div className="font-mono text-xs tracking-[0.25em] text-zinc-300">RSR INTELLIGENCE NETWORK</div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">INDEPENDENT ANALYSIS SYSTEM</div>
          </div>
        </div>
        <button onClick={signOut} className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">SIGN OUT</button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-700 mb-8">» ACCESS PROTOCOL // RSR INTELLIGENCE NETWORK</div>

          <div className="border border-amber-500/20 bg-amber-500/5 px-6 py-4 mb-8">
            <div className="font-mono text-[9px] tracking-[0.4em] text-amber-500/70 mb-1">CLEARANCE STATUS</div>
            <div className="font-mono text-xs tracking-[0.2em] text-amber-400">PENDING AUTHORIZATION</div>
          </div>

          <h1 className="font-mono text-3xl font-bold tracking-[0.12em] text-white mb-2">CLEARANCE<br />PENDING</h1>
          <div className="w-16 h-px bg-zinc-800 mb-8" />

          <div className="space-y-1 mb-8">
            {[
              ["OPERATOR", profile.handle],
              ["ROLE", profile.role.toUpperCase()],
              ["STATUS", "PENDING AUTHORIZATION"],
              ["REGISTERED", joined],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center gap-4 py-2 border-b border-zinc-900">
                <span className="font-mono text-[9px] tracking-[0.35em] text-zinc-600 w-28 shrink-0">{label}</span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-400">{val}</span>
              </div>
            ))}
          </div>

          <p className="font-mono text-[10px] tracking-[0.15em] text-zinc-600 leading-relaxed mb-8">
            Your registration has been received. Investigation Room access requires
            manual authorization by the RSR analysis team. You will be cleared
            once your identity has been verified.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/signal-room">
              <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer">→ SIGNAL ROOM</span>
            </Link>
            <Link href="/">
              <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">← RETURN HOME</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeniedScreen({ profile }: { profile: Profile }) {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
          </div>
          <div>
            <div className="font-mono text-xs tracking-[0.25em] text-zinc-300">RSR INTELLIGENCE NETWORK</div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">INDEPENDENT ANALYSIS SYSTEM</div>
          </div>
        </div>
        <button onClick={signOut} className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">SIGN OUT</button>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-700 mb-8">» ACCESS PROTOCOL // RSR INTELLIGENCE NETWORK</div>
          <div className="border border-red-500/20 bg-red-500/5 px-6 py-4 mb-8">
            <div className="font-mono text-[9px] tracking-[0.4em] text-red-500/70 mb-1">CLEARANCE STATUS</div>
            <div className="font-mono text-xs tracking-[0.2em] text-red-400">AUTHORIZATION DENIED</div>
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-[0.12em] text-white mb-2">ACCESS<br />DENIED</h1>
          <div className="w-16 h-px bg-zinc-800 mb-8" />
          <div className="space-y-1 mb-8">
            {[["OPERATOR", profile.handle], ["STATUS", "AUTHORIZATION DENIED"]].map(([label, val]) => (
              <div key={label} className="flex items-center gap-4 py-2 border-b border-zinc-900">
                <span className="font-mono text-[9px] tracking-[0.35em] text-zinc-600 w-28 shrink-0">{label}</span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-400">{val}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] tracking-[0.15em] text-zinc-600 leading-relaxed mb-8">
            Your access request has been denied by the RSR analysis team.
            Contact team leadership via the Signal Room if you believe this is an error.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/signal-room">
              <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer">→ SIGNAL ROOM</span>
            </Link>
            <Link href="/">
              <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">← RETURN HOME</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuspendedScreen({ profile }: { profile: Profile }) {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
          </div>
          <div>
            <div className="font-mono text-xs tracking-[0.25em] text-zinc-300">RSR INTELLIGENCE NETWORK</div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">INDEPENDENT ANALYSIS SYSTEM</div>
          </div>
        </div>
        <button onClick={signOut} className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">SIGN OUT</button>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-700 mb-8">» ACCESS PROTOCOL // RSR INTELLIGENCE NETWORK</div>
          <div className="border border-amber-500/20 bg-amber-500/5 px-6 py-4 mb-8">
            <div className="font-mono text-[9px] tracking-[0.4em] text-amber-500/70 mb-1">ACCOUNT STATUS</div>
            <div className="font-mono text-xs tracking-[0.2em] text-amber-400">ACCOUNT SUSPENDED</div>
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-[0.12em] text-white mb-2">ACCOUNT<br />SUSPENDED</h1>
          <div className="w-16 h-px bg-zinc-800 mb-8" />
          <div className="space-y-1 mb-8">
            {[["OPERATOR", profile.handle], ["STATUS", "SUSPENDED"]].map(([l, v]) => (
              <div key={l} className="flex items-center gap-4 py-2 border-b border-zinc-900">
                <span className="font-mono text-[9px] tracking-[0.35em] text-zinc-600 w-28 shrink-0">{l}</span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-400">{v}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] tracking-[0.15em] text-zinc-600 leading-relaxed mb-8">
            Your account has been temporarily suspended. Contact the RSR team lead to resolve your access status.
          </p>
          <Link href="/signal-room">
            <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer">→ SIGNAL ROOM</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function BannedScreen({ profile }: { profile: Profile }) {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
          </div>
          <div>
            <div className="font-mono text-xs tracking-[0.25em] text-zinc-300">RSR INTELLIGENCE NETWORK</div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">INDEPENDENT ANALYSIS SYSTEM</div>
          </div>
        </div>
        <button onClick={signOut} className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">SIGN OUT</button>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-700 mb-8">» ACCESS PROTOCOL // RSR INTELLIGENCE NETWORK</div>
          <div className="border border-red-500/20 bg-red-500/5 px-6 py-4 mb-8">
            <div className="font-mono text-[9px] tracking-[0.4em] text-red-500/70 mb-1">ACCOUNT STATUS</div>
            <div className="font-mono text-xs tracking-[0.2em] text-red-400">ACCESS PERMANENTLY REVOKED</div>
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-[0.12em] text-white mb-2">ACCESS<br />REVOKED</h1>
          <div className="w-16 h-px bg-zinc-800 mb-8" />
          <div className="space-y-1 mb-8">
            {[["OPERATOR", profile.handle], ["STATUS", "BANNED"]].map(([l, v]) => (
              <div key={l} className="flex items-center gap-4 py-2 border-b border-zinc-900">
                <span className="font-mono text-[9px] tracking-[0.35em] text-zinc-600 w-28 shrink-0">{l}</span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-400">{v}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] tracking-[0.15em] text-zinc-600 leading-relaxed mb-8">
            This account has been permanently removed from the RSR network. This action is final.
          </p>
          <Link href="/">
            <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">← RETURN HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── ProtectedRoute ───────────────────────────────────────────────────── */
export function ProtectedRoute({
  component: Component,
  adminOnly = false,
}: {
  component: React.ComponentType;
  adminOnly?: boolean;
}) {
  const { user, profile, loading, configured } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && configured && !user) {
      console.log("[auth] no user — redirecting to /access");
      setLocation("/access");
    }
    if (!loading && adminOnly && profile && profile.role !== "admin") {
      console.log("[auth] non-admin on admin route — redirecting home");
      setLocation("/");
    }
  }, [user, profile, loading, configured, adminOnly, setLocation]);

  if (loading) return <VerifyingScreen />;

  if (configured && user && profile) {
    if (adminOnly) {
      if (profile.role !== "admin") return null;
      return <Component />;
    }

    const acctStatus = profile.account_status ?? "active";
    if (acctStatus === "banned")    return <BannedScreen    profile={profile} />;
    if (acctStatus === "suspended") return <SuspendedScreen profile={profile} />;

    const approvalStatus = profile.approval_status ?? "approved";
    if (approvalStatus === "pending") return <PendingScreen profile={profile} />;
    if (approvalStatus === "denied")  return <DeniedScreen  profile={profile} />;
  }

  return <Component />;
}
