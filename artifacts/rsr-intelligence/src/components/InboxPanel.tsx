import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useInboxNav } from "@/lib/inboxNav";

/**
 * Extract { channel, message } from a notification link.
 * Handles all formats: "/investigation-room?channel=foo", "#/...", full URL.
 * Returns null if the link targets a page other than investigation-room.
 */
function parseInvestigationLink(raw: string | null): { channel?: string; message?: string } | null {
  if (!raw) return null;

  // Strip leading hashes and get the search-param portion
  const stripped = raw.replace(/^#+/, "");
  const qIdx = stripped.indexOf("?");
  const search = qIdx >= 0 ? stripped.slice(qIdx + 1) : "";

  // Only parse links that target investigation-room
  const pathPart = qIdx >= 0 ? stripped.slice(0, qIdx) : stripped;
  if (!pathPart.includes("investigation-room")) return null;

  const p = new URLSearchParams(search);
  return {
    channel: p.get("channel") ?? undefined,
    message: p.get("message") ?? undefined,
  };
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
    if (diff < 60)    return `${diff}S AGO`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}M AGO`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`;
    return `${Math.floor(diff / 86400)}D AGO`;
  } catch { return "RECENT"; }
}

/* ── InboxPanel ──────────────────────────────────────────────────────── */

interface InboxPanelProps {
  userId:         string;
  onUnreadChange: (count: number) => void;
  onClose:        () => void;
}

export function InboxPanel({ userId, onUnreadChange, onClose }: InboxPanelProps) {
  const { navigateViaInbox } = useInboxNav();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [markingAll,    setMarkingAll]    = useState(false);
  const [schemaError,   setSchemaError]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);

  /* ── Load notifications ── */
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
        (error.message?.toLowerCase().includes("notifications") &&
         error.message?.toLowerCase().includes("table"));
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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (confirmDelete) setConfirmDelete(null);
        else onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, confirmDelete]);

  /* ── Mark read + state-navigate (NO URL, NO router, ZERO 404 risk) ── */
  async function markRead(n: Notification) {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      onUnreadChange(notifications.filter(x => !x.is_read && x.id !== n.id).length);
    }

    onClose();

    // Navigate purely through React state — no window.location, no setLocation
    const inv = parseInvestigationLink(n.link);
    if (inv !== null) {
      navigateViaInbox({ page: "investigation-room", ...inv });
    }
    // Non-investigation links: just close the panel (no navigation attempted)
  }

  /* ── Mark all read ── */
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

  /* ── Delete notification ── */
  async function deleteNotification(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    setConfirmDelete(null);
    setDeletingId(id);
    const removed = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    onUnreadChange(notifications.filter(n => !n.is_read && n.id !== id).length);

    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error && removed) {
      setNotifications(prev =>
        [removed, ...prev].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      onUnreadChange(notifications.filter(n => !n.is_read).length);
    }
    setDeletingId(null);
  }

  function handleRowClick(n: Notification) {
    if (confirmDelete && confirmDelete !== n.id) {
      setConfirmDelete(null);
      return;
    }
    markRead(n);
  }

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={() => { setConfirmDelete(null); onClose(); }}
    >
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
              <div className="font-mono text-[9px] tracking-[0.1em] text-zinc-800 leading-relaxed">
                Run supabase-setup.sql in your Supabase project
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-700">NO NOTIFICATIONS</div>
            </div>
          ) : (
            notifications.map(n => {
              const isConfirm  = confirmDelete === n.id;
              const isDeleting = deletingId === n.id;
              return (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRowClick(n)}
                  onKeyDown={e => e.key === "Enter" && handleRowClick(n)}
                  className={`group relative px-5 py-4 border-b border-zinc-900/40 last:border-0 cursor-pointer transition-colors ${
                    isConfirm
                      ? "bg-red-950/20"
                      : n.is_read
                        ? "bg-black hover:bg-zinc-950/30"
                        : "bg-zinc-950/40 hover:bg-zinc-950/60"
                  } ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
                >
                  {/* Top row: type badge + age + delete control */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`font-mono text-[9px] tracking-[0.25em] border px-1.5 py-0.5 shrink-0 ${TYPE_STYLE[n.type] ?? TYPE_STYLE.NOTICE}`}>
                        {n.type}
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.15em] text-zinc-700 whitespace-nowrap">
                        {formatAge(n.created_at)}
                      </span>
                    </div>

                    {/* Delete control */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={e => deleteNotification(n.id, e)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          deleteNotification(n.id, e as unknown as React.MouseEvent);
                        }
                      }}
                      className={`shrink-0 font-mono text-[8px] tracking-[0.2em] px-1.5 py-0.5 border transition-colors cursor-pointer ${
                        isConfirm
                          ? "border-red-600/60 text-red-400 hover:bg-red-900/20"
                          : "border-transparent text-zinc-800 hover:border-zinc-800 hover:text-zinc-600 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isConfirm ? "CONFIRM" : "DEL"}
                    </div>
                  </div>

                  <div className={`font-mono text-[11px] tracking-[0.06em] leading-snug mb-1.5 ${
                    n.is_read ? "text-zinc-500" : "text-zinc-200"
                  }`}>
                    {n.title}
                  </div>

                  <div className="font-mono text-[10px] tracking-[0.04em] text-zinc-600 leading-relaxed line-clamp-2">
                    {n.body}
                  </div>

                  {n.link && !isConfirm && (
                    <div className="mt-2 font-mono text-[9px] tracking-[0.2em] text-emerald-700 truncate">
                      {n.link.replace(/^#+/, "")} →
                    </div>
                  )}
                  {isConfirm && (
                    <div className="mt-1.5 font-mono text-[9px] tracking-[0.15em] text-red-700">
                      CLICK CONFIRM TO DELETE — ESC TO CANCEL
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
