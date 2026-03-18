import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

/* ── Normalize a notification link to a safe internal wouter path ──── */
function normalizeLink(raw: string): string | null {
  if (!raw) return null;
  try {
    // If it looks like an absolute URL, extract just the path+search+hash
    const url = new URL(raw, window.location.href);
    if (url.hostname === window.location.hostname) {
      return (url.pathname + url.search + url.hash) || "/";
    }
    // External URL — don't route internally
    return null;
  } catch {
    // Not a valid URL — treat as a path fragment
    const path = raw.startsWith("/") ? raw : "/" + raw;
    return path;
  }
}

/* ── Types ───────────────────────────────────────────────────────────── */

export interface Notification {
  id:         string;
  user_id:    string;
  title:      string;
  body:       string;
  type:       "NOTICE" | "APPROVAL" | "ALERT" | "BRIEFING" | "CASE";
  link:       string | null;
  is_read:    boolean;
  created_at: string;
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

const TYPE_STYLE: Record<string, string> = {
  NOTICE:   "text-zinc-400 border-zinc-700",
  APPROVAL: "text-emerald-400 border-emerald-500/30",
  ALERT:    "text-red-400 border-red-500/30",
  BRIEFING: "text-blue-400 border-blue-500/30",
  CASE:     "text-orange-400 border-orange-500/30",
};

function formatAge(iso: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60)   return `${diff}S AGO`;
    if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}H AGO`;
    return `${Math.floor(diff / 86400)}D AGO`;
  } catch { return "RECENT"; }
}

/* ── InboxPanel ──────────────────────────────────────────────────────── */

interface InboxPanelProps {
  userId:          string;
  onUnreadChange:  (count: number) => void;
  onClose:         () => void;
}

export function InboxPanel({ userId, onUnreadChange, onClose }: InboxPanelProps) {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const [schemaError, setSchemaError] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      const isSchema =
        error.code === "PGRST204" ||
        error.message?.toLowerCase().includes("schema cache") ||
        (error.message?.toLowerCase().includes("notifications") && error.message?.toLowerCase().includes("table"));
      if (isSchema) setSchemaError(true);
      setLoading(false);
      return;
    }
    if (data) {
      setSchemaError(false);
      setNotifications(data as Notification[]);
      onUnreadChange(data.filter(n => !n.is_read).length);
    }
    setLoading(false);
  }, [userId, onUnreadChange]);

  useEffect(() => {
    load();

    // Realtime subscription for new notifications
    const channel = supabase
      .channel(`inbox-${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load, userId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function markRead(n: Notification) {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      onUnreadChange(notifications.filter(x => !x.is_read && x.id !== n.id).length);
    }
    if (n.link) {
      const path = normalizeLink(n.link);
      if (path) {
        onClose();
        setLocation(path);
      }
    }
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    setMarkingAll(true);
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    onUnreadChange(0);
    setMarkingAll(false);
  }

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div
        className="w-full max-w-sm bg-black border-l border-zinc-800 flex flex-col h-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-zinc-900 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-500">INBOX</div>
            {unread > 0 && (
              <div className="font-mono text-[9px] tracking-[0.2em] text-amber-500 mt-0.5">{unread} UNREAD</div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {unread > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="font-mono text-[9px] tracking-[0.25em] text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-40"
              >
                {markingAll ? "..." : "MARK ALL READ"}
              </button>
            )}
            <button onClick={onClose} className="font-mono text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors">✕</button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING...</div>
            </div>
          ) : schemaError ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-800" />
              <div className="font-mono text-[9px] tracking-[0.2em] text-amber-800">SCHEMA UPDATE REQUIRED</div>
              <div className="font-mono text-[9px] tracking-[0.1em] text-zinc-800 leading-relaxed">Run supabase-setup.sql in your Supabase project</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-700">NO NOTIFICATIONS</div>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => markRead(n)}
                onKeyDown={e => e.key === "Enter" && markRead(n)}
                className={`px-5 py-4 border-b border-zinc-900/40 last:border-0 cursor-pointer transition-colors ${
                  n.is_read ? "bg-black hover:bg-zinc-950/30" : "bg-zinc-950/40 hover:bg-zinc-950/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-0.5" />}
                    <span className={`font-mono text-[9px] tracking-[0.25em] border px-1.5 py-0.5 shrink-0 ${TYPE_STYLE[n.type] ?? TYPE_STYLE.NOTICE}`}>
                      {n.type}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.15em] text-zinc-700 whitespace-nowrap shrink-0">
                    {formatAge(n.created_at)}
                  </span>
                </div>

                <div className={`font-mono text-[11px] tracking-[0.06em] leading-snug mb-1.5 ${n.is_read ? "text-zinc-500" : "text-zinc-200"}`}>
                  {n.title}
                </div>

                <div className="font-mono text-[10px] tracking-[0.04em] text-zinc-600 leading-relaxed line-clamp-2">
                  {n.body}
                </div>

                {n.link && (
                  <div className="mt-2 font-mono text-[9px] tracking-[0.2em] text-emerald-700">
                    {n.link} →
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

