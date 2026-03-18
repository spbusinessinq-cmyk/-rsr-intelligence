import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isConfigured } from "./supabase";

export interface Profile {
  id: string;
  handle: string;
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
  signUp: (email: string, password: string, handle: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) {
      setProfile(data as Profile);
    } else {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const handle = (authUser.email ?? "operator")
          .split("@")[0]
          .toUpperCase()
          .replace(/[^A-Z0-9-]/g, "-")
          .slice(0, 24);
        await supabase.from("profiles").upsert({
          id: userId,
          email: authUser.email ?? "",
          handle,
          role: "member",
          approval_status: "pending",
          account_status: "active",
        }, { onConflict: "id" });
        setProfile({
          id: userId,
          handle,
          role: "member",
          approval_status: "pending",
          account_status: "active",
          email: authUser.email ?? "",
        });
      }
    }
  }

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, handle: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        handle: handle.toUpperCase().replace(/[^A-Z0-9-]/g, "-"),
        role: "member",
        approval_status: "pending",
      });
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
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

function VerifyingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-700 animate-pulse">
          VERIFYING CREDENTIALS...
        </div>
        <div className="w-32 h-px bg-zinc-900 mx-auto" />
        <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-800">
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
            <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-700">INDEPENDENT ANALYSIS SYSTEM</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors"
        >
          SIGN OUT
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-700 mb-8">
            » ACCESS PROTOCOL // RSR INTELLIGENCE NETWORK
          </div>

          <div className="border border-amber-500/20 bg-amber-500/5 px-6 py-4 mb-8">
            <div className="font-mono text-[8px] tracking-[0.4em] text-amber-500/70 mb-1">CLEARANCE STATUS</div>
            <div className="font-mono text-xs tracking-[0.2em] text-amber-400">PENDING AUTHORIZATION</div>
          </div>

          <h1 className="font-mono text-3xl font-bold tracking-[0.12em] text-white mb-2">
            CLEARANCE
            <br />PENDING
          </h1>
          <div className="w-16 h-px bg-zinc-800 mb-8" />

          <div className="space-y-1 mb-8">
            {[
              ["OPERATOR", profile.handle],
              ["ROLE", profile.role.toUpperCase()],
              ["STATUS", "PENDING AUTHORIZATION"],
              ["REGISTERED", joined],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center gap-4 py-2 border-b border-zinc-900">
                <span className="font-mono text-[8px] tracking-[0.35em] text-zinc-600 w-28 shrink-0">{label}</span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-400">{val}</span>
              </div>
            ))}
          </div>

          <p className="font-mono text-[9px] tracking-[0.15em] text-zinc-600 leading-relaxed mb-8">
            Your registration has been received. Investigation Room access requires
            manual authorization by the RSR analysis team. You will be cleared
            once your identity has been verified.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/signal-room">
              <span className="font-mono text-[9px] tracking-[0.3em] text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer">
                → SIGNAL ROOM
              </span>
            </Link>
            <Link href="/">
              <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">
                ← RETURN HOME
              </span>
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
            <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-700">INDEPENDENT ANALYSIS SYSTEM</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors"
        >
          SIGN OUT
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-700 mb-8">
            » ACCESS PROTOCOL // RSR INTELLIGENCE NETWORK
          </div>

          <div className="border border-red-500/20 bg-red-500/5 px-6 py-4 mb-8">
            <div className="font-mono text-[8px] tracking-[0.4em] text-red-500/70 mb-1">CLEARANCE STATUS</div>
            <div className="font-mono text-xs tracking-[0.2em] text-red-400">AUTHORIZATION DENIED</div>
          </div>

          <h1 className="font-mono text-3xl font-bold tracking-[0.12em] text-white mb-2">
            ACCESS
            <br />DENIED
          </h1>
          <div className="w-16 h-px bg-zinc-800 mb-8" />

          <div className="space-y-1 mb-8">
            {[
              ["OPERATOR", profile.handle],
              ["STATUS", "AUTHORIZATION DENIED"],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center gap-4 py-2 border-b border-zinc-900">
                <span className="font-mono text-[8px] tracking-[0.35em] text-zinc-600 w-28 shrink-0">{label}</span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-400">{val}</span>
              </div>
            ))}
          </div>

          <p className="font-mono text-[9px] tracking-[0.15em] text-zinc-600 leading-relaxed mb-8">
            Your access request has been denied by the RSR analysis team.
            Contact team leadership via the Signal Room if you believe this is an error.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/signal-room">
              <span className="font-mono text-[9px] tracking-[0.3em] text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer">
                → SIGNAL ROOM
              </span>
            </Link>
            <Link href="/">
              <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">
                ← RETURN HOME
              </span>
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
            <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-700">INDEPENDENT ANALYSIS SYSTEM</div>
          </div>
        </div>
        <button onClick={signOut} className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">SIGN OUT</button>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-700 mb-8">» ACCESS PROTOCOL // RSR INTELLIGENCE NETWORK</div>
          <div className="border border-amber-500/20 bg-amber-500/5 px-6 py-4 mb-8">
            <div className="font-mono text-[8px] tracking-[0.4em] text-amber-500/70 mb-1">ACCOUNT STATUS</div>
            <div className="font-mono text-xs tracking-[0.2em] text-amber-400">ACCOUNT SUSPENDED</div>
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-[0.12em] text-white mb-2">ACCOUNT<br />SUSPENDED</h1>
          <div className="w-16 h-px bg-zinc-800 mb-8" />
          <div className="space-y-1 mb-8">
            {[["OPERATOR", profile.handle], ["STATUS", "SUSPENDED"]].map(([l, v]) => (
              <div key={l} className="flex items-center gap-4 py-2 border-b border-zinc-900">
                <span className="font-mono text-[8px] tracking-[0.35em] text-zinc-600 w-28 shrink-0">{l}</span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-400">{v}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[9px] tracking-[0.15em] text-zinc-600 leading-relaxed mb-8">
            Your account has been temporarily suspended. Contact the RSR team lead to resolve your access status.
          </p>
          <Link href="/signal-room">
            <span className="font-mono text-[9px] tracking-[0.3em] text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer">→ SIGNAL ROOM</span>
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
            <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-700">INDEPENDENT ANALYSIS SYSTEM</div>
          </div>
        </div>
        <button onClick={signOut} className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">SIGN OUT</button>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-700 mb-8">» ACCESS PROTOCOL // RSR INTELLIGENCE NETWORK</div>
          <div className="border border-red-500/20 bg-red-500/5 px-6 py-4 mb-8">
            <div className="font-mono text-[8px] tracking-[0.4em] text-red-500/70 mb-1">ACCOUNT STATUS</div>
            <div className="font-mono text-xs tracking-[0.2em] text-red-400">ACCESS PERMANENTLY REVOKED</div>
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-[0.12em] text-white mb-2">ACCESS<br />REVOKED</h1>
          <div className="w-16 h-px bg-zinc-800 mb-8" />
          <div className="space-y-1 mb-8">
            {[["OPERATOR", profile.handle], ["STATUS", "BANNED"]].map(([l, v]) => (
              <div key={l} className="flex items-center gap-4 py-2 border-b border-zinc-900">
                <span className="font-mono text-[8px] tracking-[0.35em] text-zinc-600 w-28 shrink-0">{l}</span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-400">{v}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[9px] tracking-[0.15em] text-zinc-600 leading-relaxed mb-8">
            This account has been permanently removed from the RSR network. This action is final.
          </p>
          <Link href="/">
            <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">← RETURN HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, profile, loading, configured } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && configured && !user) {
      setLocation("/access");
    }
    if (!loading && adminOnly && profile && profile.role !== "admin") {
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
    if (acctStatus === "banned") return <BannedScreen profile={profile} />;
    if (acctStatus === "suspended") return <SuspendedScreen profile={profile} />;

    const status = profile.approval_status ?? "approved";
    if (status === "pending") return <PendingScreen profile={profile} />;
    if (status === "denied") return <DeniedScreen profile={profile} />;
  }

  return <Component />;
}
