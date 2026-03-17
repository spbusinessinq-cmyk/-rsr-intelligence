import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isConfigured } from "./supabase";

export interface Profile {
  id: string;
  handle: string;
  role: string;
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
      .select("id, handle, role")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
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
        role: "ANALYST",
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

export function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading, configured } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && configured && !user) {
      setLocation("/access");
    }
  }, [user, loading, configured, setLocation]);

  if (loading) {
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

  return <Component />;
}
