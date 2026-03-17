import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

type Mode = "signin" | "register";

export default function Access() {
  const { user, loading, configured, signIn, signUp } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && user) setLocation("/investigation-room");
  }, [user, loading, setLocation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setSubmitting(false);
      } else {
        setLocation("/investigation-room");
      }
    } else {
      if (!handle.trim()) {
        setError("OPERATOR HANDLE is required.");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, handle);
      if (error) {
        setError(error);
        setSubmitting(false);
      } else {
        setSuccess(true);
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative">
      {/* Scanline */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025] bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.3)_3px,rgba(0,0,0,0.3)_4px)] z-50" />

      {/* Header */}
      <div className="border-b border-zinc-900 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <img src="/logo.png" alt="RSR" className="h-8 w-auto object-contain grayscale" />
          <div>
            <div className="font-mono text-xs tracking-[0.35em] text-white group-hover:text-emerald-400 transition-colors">
              RSR INTELLIGENCE NETWORK
            </div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-zinc-700">
              INDEPENDENT ANALYSIS SYSTEM
            </div>
          </div>
        </Link>
        <Link href="/signal-room" className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">
          SIGNAL ROOM →
        </Link>
      </div>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {/* System header */}
          <div className="mb-10">
            <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-1 bg-zinc-800" />
              ACCESS PROTOCOL // RSR INTELLIGENCE NETWORK
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
              AUTHENTICATION<br />GATEWAY
            </h1>
            <p className="font-mono text-[10px] tracking-widest text-zinc-600 leading-relaxed">
              Restricted access. Verified operators only.
              Investigation Room is restricted to authorized team members.
            </p>
          </div>

          {/* Not configured warning */}
          {!configured && (
            <div className="border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
              <div className="font-mono text-[9px] tracking-[0.3em] text-amber-500/70 mb-2">
                SYSTEM NOTICE
              </div>
              <p className="font-mono text-[9px] tracking-widest text-amber-500/50 leading-relaxed">
                Supabase connection not configured. Add VITE_SUPABASE_URL and
                VITE_SUPABASE_ANON_KEY to enable live authentication.
              </p>
            </div>
          )}

          {/* Success state */}
          {success ? (
            <div className="border border-emerald-500/20 bg-emerald-500/5 p-6">
              <div className="font-mono text-[9px] tracking-[0.4em] text-emerald-500 mb-3">
                ACCESS REQUEST SUBMITTED
              </div>
              <p className="font-mono text-[10px] tracking-widest text-zinc-500 leading-relaxed mb-4">
                Check your email to confirm your account, then sign in.
              </p>
              <button
                onClick={() => { setSuccess(false); setMode("signin"); }}
                className="font-mono text-[9px] tracking-[0.3em] text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                → PROCEED TO SIGN IN
              </button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex border border-zinc-900 mb-6">
                {(["signin", "register"] as Mode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(null); }}
                    className={`flex-1 py-2.5 font-mono text-[9px] tracking-[0.3em] transition-colors ${
                      mode === m
                        ? "bg-zinc-900 text-zinc-300"
                        : "text-zinc-700 hover:text-zinc-500"
                    }`}
                  >
                    {m === "signin" ? "SIGN IN" : "REGISTER"}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {mode === "register" && (
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-2">
                      OPERATOR HANDLE
                    </label>
                    <input
                      type="text"
                      value={handle}
                      onChange={e => setHandle(e.target.value)}
                      placeholder="e.g. FIELD-ANALYST"
                      disabled={!configured || submitting}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 tracking-widest placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/40 transition-colors disabled:opacity-40"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="operator@domain.com"
                    required
                    disabled={!configured || submitting}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 tracking-widest placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/40 transition-colors disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-2">
                    CREDENTIALS
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    disabled={!configured || submitting}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 tracking-widest placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/40 transition-colors disabled:opacity-40"
                  />
                </div>

                {error && (
                  <div className="border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <p className="font-mono text-[9px] tracking-widest text-red-400/70">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!configured || submitting}
                  className="w-full border border-emerald-500/30 bg-emerald-500/5 py-3 font-mono text-[10px] tracking-[0.35em] text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-2"
                >
                  {submitting
                    ? "AUTHENTICATING..."
                    : mode === "signin"
                    ? "AUTHENTICATE →"
                    : "REQUEST ACCESS →"}
                </button>
              </form>
            </>
          )}

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between">
            <Link href="/briefing" className="font-mono text-[9px] tracking-[0.25em] text-zinc-700 hover:text-zinc-500 transition-colors">
              REQUEST BRIEFING
            </Link>
            <Link href="/" className="font-mono text-[9px] tracking-[0.25em] text-zinc-700 hover:text-zinc-500 transition-colors">
              ← RETURN HOME
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
