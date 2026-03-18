import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function Briefing() {
  const [form, setForm] = useState({ name: "", organization: "", role: "", interest: "", email: "" });
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (profile?.role === "admin") {
      setLocation("/command");
    } else {
      setLocation("/investigation-room");
    }
  }, [user, profile, authLoading, setLocation]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.interest.trim()) return;
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("brief_requests").insert({
      name:         form.name.trim(),
      organization: form.organization.trim() || null,
      role:         form.role.trim() || null,
      interest:     form.interest.trim(),
      email:        form.email.trim().toLowerCase(),
      status:       "NEW",
    });

    setSubmitting(false);

    if (error) {
      console.error("[Briefing] submit error:", error);
      setSubmitError("Submission failed — please try again or contact us directly.");
      return;
    }

    setSubmitted(true);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-700 animate-pulse">AUTHENTICATING...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative">
      <div className="pointer-events-none fixed inset-0 opacity-[0.025] bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.3)_3px,rgba(0,0,0,0.3)_4px)] z-50" />

      {/* Header */}
      <div className="border-b border-zinc-900 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <img src="/logo.png" alt="RSR" className="h-8 w-auto object-contain grayscale" />
          <div>
            <div className="font-mono text-xs tracking-[0.35em] text-white group-hover:text-emerald-400 transition-colors">
              RSR INTELLIGENCE NETWORK
            </div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-zinc-700">
              INDEPENDENT ANALYSIS SYSTEM
            </div>
          </div>
        </Link>
        <Link href="/access" className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">
          ACCESS GATEWAY →
        </Link>
      </div>

      {/* Main */}
      <div className="max-w-2xl mx-auto w-full px-6 py-16">

        <div className="mb-10">
          <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-1 bg-zinc-800" />
            BRIEFING REQUEST // RSR INTELLIGENCE NETWORK
          </div>
          <h1 className="text-4xl font-semibold text-white tracking-tight mb-4">
            REQUEST<br />BRIEFING
          </h1>
          <p className="font-mono text-[11px] tracking-widest text-zinc-600 leading-relaxed max-w-lg">
            RSR provides structured intelligence briefings on active monitoring
            areas to vetted individuals and organizations. Complete this form to
            register your interest. All inquiries are reviewed by the RSR
            analysis team.
          </p>
        </div>

        {submitted ? (
          <div className="border border-emerald-500/20 bg-emerald-500/5 p-8">
            <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-500 mb-4">
              BRIEFING REQUEST LOGGED
            </div>
            <p className="font-mono text-[11px] tracking-widest text-zinc-500 leading-relaxed mb-6">
              Your inquiry has been received and logged. The RSR analysis team will review
              your request and respond via the contact address provided.
              Review cycles are conducted on a bi-weekly basis.
            </p>
            <div className="border-t border-zinc-900 pt-5 flex items-center gap-6">
              <Link href="/" className="font-mono text-[10px] tracking-[0.3em] text-zinc-600 hover:text-zinc-400 transition-colors">
                ← RETURN HOME
              </Link>
              <Link href="/signal-room" className="font-mono text-[10px] tracking-[0.3em] text-emerald-600 hover:text-emerald-400 transition-colors">
                ENTER SIGNAL ROOM →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.35em] text-zinc-600 mb-2">NAME</label>
                <input
                  name="name" value={form.name} onChange={handleChange} required
                  placeholder="Full name"
                  className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 tracking-widest placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/40 transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.35em] text-zinc-600 mb-2">ORGANIZATION</label>
                <input
                  name="organization" value={form.organization} onChange={handleChange}
                  placeholder="Institution or independent"
                  className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 tracking-widest placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.35em] text-zinc-600 mb-2">PROFESSIONAL ROLE</label>
              <input
                name="role" value={form.role} onChange={handleChange}
                placeholder="e.g. Investigative Journalist, Policy Analyst, Risk Officer"
                className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 tracking-widest placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.35em] text-zinc-600 mb-2">AREA OF INTEREST</label>
              <textarea
                name="interest" value={form.interest} onChange={handleChange} required
                rows={4}
                placeholder="Describe the intelligence areas or topics relevant to your inquiry..."
                className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 tracking-widest placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/40 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.35em] text-zinc-600 mb-2">CONTACT ADDRESS</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="Secure contact email"
                className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 tracking-widest placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
            </div>

            {submitError && (
              <div className="border border-red-900/40 bg-red-950/10 px-4 py-3">
                <div className="font-mono text-[10px] tracking-[0.2em] text-red-400">{submitError}</div>
              </div>
            )}

            <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
              <p className="font-mono text-[10px] tracking-widest text-zinc-800 leading-relaxed max-w-xs">
                All submissions are reviewed manually. RSR does not share contact information.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="border border-emerald-500/30 bg-emerald-500/5 px-6 py-3 font-mono text-[10px] tracking-[0.35em] text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT INQUIRY →"}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
