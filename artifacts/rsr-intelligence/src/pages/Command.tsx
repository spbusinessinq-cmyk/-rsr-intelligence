import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth, type Profile } from "@/lib/auth";

/* ── Types ─────────────────────────────────────────────────────────── */

interface MessageRow {
  id: string;
  channel_id: string;
  handle: string;
  body: string;
  created_at: string;
  role?: string;
  pinned?: boolean;
}

interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  archived: boolean;
}

interface Case {
  id: string;
  ref: string;
  name: string;
  stage: string;
  priority: string;
  channel_id: string | null;
  description: string | null;
}

const STAGES = ["NEW", "BUILDING", "REVIEW", "MONITORING", "READY"];

interface BriefRequest {
  id: string;
  name: string;
  organization: string | null;
  role: string | null;
  interest: string;
  email: string;
  status: "NEW" | "REVIEWING" | "APPROVED" | "CLOSED";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function displayHandle(op: Profile): string {
  if (op.handle && op.handle.trim()) return op.handle;
  if (op.email) return op.email.split("@")[0].toUpperCase().replace(/[^A-Z0-9-]/g, "-").slice(0, 24);
  return "UNKNOWN";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  }).toUpperCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

/* ── Badges ─────────────────────────────────────────────────────────── */

function ClearanceBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    approved: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    pending:  "text-amber-400 border-amber-500/30 bg-amber-500/5",
    denied:   "text-red-400 border-red-500/30 bg-red-500/5",
  };
  return (
    <span className={`font-mono text-[8px] tracking-[0.3em] border px-1.5 py-0.5 ${cls[status] ?? "text-zinc-500 border-zinc-700"}`}>
      {(status ?? "—").toUpperCase()}
    </span>
  );
}

function AccountBadge({ status }: { status?: string }) {
  if (!status || status === "active") return null;
  const cls: Record<string, string> = {
    suspended: "text-amber-400 border-amber-500/30 bg-amber-500/5",
    banned:    "text-red-400 border-red-900/30 bg-red-900/5",
  };
  return (
    <span className={`font-mono text-[10px] tracking-[0.25em] border px-2 py-0.5 ${cls[status] ?? "text-zinc-500 border-zinc-700"}`}>
      {status.toUpperCase()}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cls: Record<string, string> = {
    admin:   "text-emerald-300 border-emerald-400/30 bg-emerald-500/5",
    lead:    "text-blue-300 border-blue-400/20 bg-blue-500/5",
    analyst: "text-zinc-300 border-zinc-600",
    member:  "text-zinc-600 border-zinc-800",
  };
  return (
    <span className={`font-mono text-[10px] tracking-[0.25em] border px-2 py-0.5 ${cls[role] ?? "text-zinc-500 border-zinc-700"}`}>
      {(role ?? "—").toUpperCase()}
    </span>
  );
}

const ROLES = ["member", "analyst", "lead", "admin"] as const;
const ACCT_STATUSES = ["active", "suspended", "banned"] as const;

/* ── ActionBtn ──────────────────────────────────────────────────────── */

function ActionBtn({
  label, color, loading, disabled, onClick,
}: {
  label: string;
  color: "emerald" | "red" | "amber" | "zinc" | "active";
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const cls = {
    emerald: "text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10",
    red:     "text-red-500 border-red-500/20 hover:bg-red-500/10",
    amber:   "text-amber-500 border-amber-500/20 hover:bg-amber-500/10",
    zinc:    "text-zinc-500 border-zinc-700 hover:bg-zinc-900",
    active:  "text-emerald-300 border-emerald-400/30 bg-emerald-500/5",
  }[color];
  return (
    <button disabled={disabled} onClick={onClick}
      className={`font-mono text-[11px] tracking-[0.2em] border px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}>
      {loading ? "..." : label}
    </button>
  );
}

/* ── Identity Edit Modal ─────────────────────────────────────────────── */

function IdentityModal({
  op,
  onSave,
  onClose,
}: {
  op: Profile;
  onSave: (id: string, handle: string, title: string) => Promise<{ error: string | null }>;
  onClose: () => void;
}) {
  const [handle,    setHandle]    = useState(displayHandle(op));
  const [title,     setTitle]     = useState(op.title ?? "");
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit() {
    if (!handle.trim()) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    const normalized = handle.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "-").slice(0, 32);
    const { error } = await onSave(op.id, normalized, title.trim());
    setSaving(false);
    if (error) { setSaveError(error); }
    else        { setSaved(true); setTimeout(onClose, 900); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="bg-black border border-zinc-800 w-full max-w-md mx-6 p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500">EDIT IDENTITY</div>
          <button onClick={onClose} className="font-mono text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors">✕</button>
        </div>

        <div className="border border-zinc-900 bg-zinc-950/50 px-4 py-2.5 flex items-center gap-3">
          <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-600">OPERATOR</div>
          <div className="font-mono text-[11px] text-zinc-400">{displayHandle(op)}</div>
          {op.email && <div className="font-mono text-[10px] text-zinc-700 truncate ml-auto">{op.email}</div>}
        </div>

        <div>
          <label className="block font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-2">
            HANDLE <span className="text-zinc-800">— required, uppercase, alphanumeric + hyphens</span>
          </label>
          <input
            value={handle}
            onChange={e => setHandle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            autoFocus
            className="w-full bg-black border border-zinc-700 focus:border-zinc-500 font-mono text-xs tracking-[0.12em] text-zinc-300 px-3 py-2.5 outline-none transition-colors placeholder-zinc-800"
          />
        </div>

        <div>
          <label className="block font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-2">
            TITLE <span className="text-zinc-800">— optional</span>
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="e.g. Senior Analyst, Lead Investigator"
            className="w-full bg-black border border-zinc-700 focus:border-zinc-500 font-mono text-xs tracking-[0.06em] text-zinc-300 px-3 py-2.5 outline-none transition-colors placeholder-zinc-800"
          />
        </div>

        {saveError && (
          <div className="border border-red-900/40 bg-red-950/10 px-3 py-2">
            <div className="font-mono text-[10px] tracking-[0.2em] text-red-400">SAVE FAILED: {saveError}</div>
          </div>
        )}
        {saved && (
          <div className="border border-emerald-900/30 bg-emerald-950/10 px-3 py-2">
            <div className="font-mono text-[10px] tracking-[0.2em] text-emerald-400">IDENTITY UPDATED ✓</div>
          </div>
        )}
        <div className="flex items-center gap-4 pt-2 border-t border-zinc-900">
          <button
            onClick={submit}
            disabled={!handle.trim() || saving || saved}
            className="font-mono text-[11px] tracking-[0.25em] text-emerald-600 hover:text-emerald-400 border border-emerald-900/30 hover:border-emerald-800/40 px-5 py-2.5 transition-colors disabled:opacity-30"
          >
            {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE IDENTITY"}
          </button>
          <button onClick={onClose} className="font-mono text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
            CANCEL
          </button>
          <span className="ml-auto font-mono text-[9px] text-zinc-800">{op.id.slice(0, 8)}…</span>
        </div>
      </div>
    </div>
  );
}

/* ── Case Edit Modal ─────────────────────────────────────────────────── */

function CaseEditModal({
  c,
  channels,
  onSave,
  onClose,
}: {
  c: Case;
  channels: Channel[];
  onSave: (id: string, update: { name: string; channel_id: string | null; description: string | null }) => Promise<boolean>;
  onClose: () => void;
}) {
  const [name,        setName]        = useState(c.name);
  const [channelId,   setChannelId]   = useState(c.channel_id ?? "");
  const [description, setDescription] = useState(c.description ?? "");
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);
  const [saved,       setSaved]       = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit() {
    const trimmedName = name.trim().toUpperCase();
    if (!trimmedName) { setSaveError("NAME is required"); return; }
    setSaving(true);
    setSaveError(null);
    const ok = await onSave(c.id, {
      name:        trimmedName,
      channel_id:  channelId || null,
      description: description.trim() || null,
    });
    setSaving(false);
    if (!ok) { setSaveError("Save failed — check admin role in DB"); }
    else      { setSaved(true); setTimeout(onClose, 700); }
  }

  const activeChannels = channels.filter(ch => !ch.archived);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="bg-black border border-zinc-800 w-full max-w-md mx-6 p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500">EDIT CASE</div>
          <button onClick={onClose} className="font-mono text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors">✕</button>
        </div>

        <div className="border border-zinc-900 bg-zinc-950/50 px-4 py-2.5 flex items-center gap-3">
          <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-600">REF</div>
          <div className="font-mono text-[11px] text-emerald-600 tracking-widest">{c.ref}</div>
          <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-700 ml-auto">ID: {c.id.slice(0, 8)}…</div>
        </div>

        <div>
          <label className="block font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-2">
            NAME <span className="text-zinc-800">— required</span>
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            autoFocus
            className="w-full bg-black border border-zinc-700 focus:border-zinc-500 font-mono text-xs tracking-[0.12em] text-zinc-300 px-3 py-2.5 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-2">CHANNEL</label>
          <select
            value={channelId}
            onChange={e => setChannelId(e.target.value)}
            className="w-full bg-black border border-zinc-700 font-mono text-[11px] text-zinc-400 px-3 py-2.5 outline-none"
          >
            <option value="">— NONE —</option>
            {activeChannels.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-2">
            DESCRIPTION <span className="text-zinc-800">— optional</span>
          </label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Brief case description"
            className="w-full bg-black border border-zinc-700 focus:border-zinc-500 font-mono text-xs tracking-[0.06em] text-zinc-300 px-3 py-2.5 outline-none transition-colors placeholder-zinc-800"
          />
        </div>

        {saveError && (
          <div className="border border-red-900/40 bg-red-950/10 px-3 py-2">
            <div className="font-mono text-[10px] tracking-[0.2em] text-red-400">SAVE FAILED: {saveError}</div>
          </div>
        )}
        {saved && (
          <div className="border border-emerald-900/30 bg-emerald-950/10 px-3 py-2">
            <div className="font-mono text-[10px] tracking-[0.2em] text-emerald-400">CASE UPDATED ✓</div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t border-zinc-900">
          <button
            onClick={submit}
            disabled={!name.trim() || saving || saved}
            className="font-mono text-[11px] tracking-[0.25em] text-emerald-600 hover:text-emerald-400 border border-emerald-900/30 hover:border-emerald-800/40 px-5 py-2.5 transition-colors disabled:opacity-30"
          >
            {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE CASE"}
          </button>
          <button onClick={onClose} className="font-mono text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Brief Request Status Badge ─────────────────────────────────────── */

const BRIEF_STATUSES = ["NEW", "REVIEWING", "APPROVED", "CLOSED"] as const;

function BriefStatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    NEW:       "text-amber-400 border-amber-500/30 bg-amber-500/5",
    REVIEWING: "text-blue-400 border-blue-500/30 bg-blue-500/5",
    APPROVED:  "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    CLOSED:    "text-zinc-600 border-zinc-700",
  };
  return (
    <span className={`font-mono text-[9px] tracking-[0.3em] border px-1.5 py-0.5 ${cls[status] ?? "text-zinc-500 border-zinc-700"}`}>
      {status}
    </span>
  );
}

/* ── Brief Request View Modal ────────────────────────────────────────── */

function BriefRequestModal({
  req,
  onStatusChange,
  onClose,
}: {
  req: BriefRequest;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function changeStatus(status: string) {
    setSaving(true);
    await onStatusChange(req.id, status);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.88)" }}>
      <div className="bg-black border border-zinc-800 w-full max-w-2xl mx-6 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-[0.4em] text-zinc-500">BRIEFING REQUEST</div>
          <button onClick={onClose} className="font-mono text-[10px] text-zinc-700 hover:text-zinc-400 transition-colors">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            ["ID",           req.id.slice(0, 8) + "…"],
            ["STATUS",       req.status],
            ["NAME",         req.name],
            ["ORGANIZATION", req.organization ?? "—"],
            ["ROLE",         req.role ?? "—"],
            ["EMAIL",        req.email],
            ["RECEIVED",     new Date(req.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()],
          ].map(([label, val]) => (
            <div key={label} className="border border-zinc-900 bg-zinc-950 px-3 py-2">
              <div className="font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-1">{label}</div>
              <div className="font-mono text-[11px] text-zinc-300 break-all leading-relaxed">{val}</div>
            </div>
          ))}
        </div>

        <div className="border border-zinc-900 bg-zinc-950 px-3 py-3">
          <div className="font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-2">AREA OF INTEREST / REQUEST</div>
          <div className="font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{req.interest}</div>
        </div>

        <div className="border-t border-zinc-900 pt-4 space-y-3">
          <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-600">SET STATUS</div>
          <div className="flex items-center gap-2 flex-wrap">
            {BRIEF_STATUSES.map(s => (
              <button
                key={s}
                disabled={saving || req.status === s}
                onClick={() => changeStatus(s)}
                className={`font-mono text-[10px] tracking-[0.2em] border px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  req.status === s
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                    : "text-zinc-500 border-zinc-700 hover:text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {saving ? "..." : s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="font-mono text-[10px] tracking-[0.25em] text-zinc-600 hover:text-zinc-400 transition-colors">CLOSE</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Command Console ───────────────────────────────────────────── */

export default function Command() {
  const { profile: myProfile, signOut } = useAuth();

  const [operators,      setOperators]      = useState<Profile[]>([]);
  const [messages,       setMessages]       = useState<MessageRow[]>([]);
  const [channels,       setChannels]       = useState<Channel[]>([]);
  const [cases,          setCases]          = useState<Case[]>([]);
  const [briefRequests,  setBriefRequests]  = useState<BriefRequest[]>([]);
  const [viewingBrief,   setViewingBrief]   = useState<BriefRequest | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [actionLoading,  setActionLoading]  = useState<string | null>(null);
  const [toast,          setToast]          = useState<string | null>(null);
  const [toastType,      setToastType]      = useState<"ok" | "err">("ok");
  const [expandedOp,     setExpandedOp]     = useState<string | null>(null);

  /* ── Identity edit ── */
  const [editingOp, setEditingOp] = useState<Profile | null>(null);

  /* ── Channel admin state ── */
  const [chCreateOpen,  setChCreateOpen]  = useState(false);
  const [chNewName,     setChNewName]     = useState("");
  const [chRenaming,        setChRenaming]        = useState<string | null>(null);
  const [chRenameVal,       setChRenameVal]       = useState("");
  const [chArchivingId,     setChArchivingId]     = useState<string | null>(null);
  const [chConfirmDeleteId, setChConfirmDeleteId] = useState<string | null>(null);
  const [chDeletingId,      setChDeletingId]      = useState<string | null>(null);

  /* ── Case admin state ── */
  const [caseCreateOpen,  setCaseCreateOpen]  = useState(false);
  const [caseCreating,    setCaseCreating]    = useState(false);
  const [caseCreateError, setCaseCreateError] = useState<string | null>(null);
  const [caseEditTarget,  setCaseEditTarget]  = useState<Case | null>(null);
  const [newCaseForm, setNewCaseForm] = useState({
    ref: "", name: "", stage: "NEW", priority: "NORMAL", channel_id: "", description: "",
  });

  /* ── Toast helper ── */
  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(null), 3500);
  }

  /* ── Fetch all data ── */
  const fetchData = useCallback(async () => {
    const [opRes, msgRes, chRes, csRes, brRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("room_messages").select("id, channel_id, handle, body, created_at, role, pinned").order("created_at", { ascending: false }).limit(40),
      supabase.from("room_channels").select("*").order("created_at", { ascending: true }),
      supabase.from("investigation_cases").select("*").order("created_at", { ascending: true }),
      supabase.from("brief_requests").select("*").order("created_at", { ascending: false }),
    ]);
    if (opRes.data)  setOperators(opRes.data as Profile[]);
    if (msgRes.data) setMessages(msgRes.data as MessageRow[]);
    if (chRes.data)  setChannels(chRes.data as Channel[]);
    if (csRes.data)  setCases(csRes.data as Case[]);
    if (brRes.data)  setBriefRequests(brRes.data as BriefRequest[]);
    setLoading(false);
  }, []);

  /* ── Brief request status update ── */
  async function updateBriefStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from("brief_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id");
    if (error) {
      showToast("FAILED: " + error.message, "err");
      return;
    }
    if (!data || data.length === 0) {
      showToast("UPDATE BLOCKED — ensure admin role in DB", "err");
      return;
    }
    showToast("STATUS → " + status, "ok");
    await fetchData();
  }

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Profile update helper ── */
  async function updateProfile(id: string, update: Record<string, string>, label: string) {
    const key = id + JSON.stringify(update);
    setActionLoading(key);
    const { error } = await supabase.from("profiles").update(update).eq("id", id);
    if (error) { showToast("FAILED: " + error.message, "err"); }
    else        { showToast(label, "ok"); await fetchData(); }
    setActionLoading(null);
  }

  /* ── Identity save ── */
  async function saveIdentity(id: string, handle: string, title: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("profiles").update({
      handle,
      title: title || null,
    }).eq("id", id);
    if (error) {
      showToast("FAILED: " + error.message, "err");
      return { error: error.message };
    }
    showToast("IDENTITY UPDATED → " + handle, "ok");
    setEditingOp(null);
    await fetchData();
    return { error: null };
  }

  /* ── Channel ops ── */
  async function createChannel() {
    const slug = chNewName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!slug) return;
    const id = crypto.randomUUID();
    const { error } = await supabase.from("room_channels").insert({ id, slug, name: slug, description: null });
    if (error) {
      if (error.code === "23505") {
        showToast("CHANNEL ALREADY EXISTS: #" + slug, "err");
      } else {
        showToast("FAILED: " + error.message, "err");
      }
      return;
    }
    showToast("CHANNEL CREATED: #" + slug, "ok");
    setChCreateOpen(false); setChNewName(""); await fetchData();
  }

  async function archiveChannel(id: string) {
    const ch = channels.find(c => c.id === id);
    const label = ch ? ch.name : id.slice(0, 8);
    setChArchivingId(id);
    const { data, error } = await supabase
      .from("room_channels")
      .update({ archived: true })
      .eq("id", id)
      .select("id");
    setChArchivingId(null);
    if (error) {
      console.error("[CMD] archiveChannel error:", error);
      showToast("ARCHIVE FAILED: " + error.message, "err");
      return;
    }
    if (!data || data.length === 0) {
      console.error("[CMD] archiveChannel: RLS blocked or row not found for id", id);
      showToast("ARCHIVE BLOCKED — ensure admin role in profiles table", "err");
      return;
    }
    showToast("ARCHIVED: #" + label, "ok");
    await fetchData();
  }

  async function restoreChannel(id: string) {
    const ch = channels.find(c => c.id === id);
    const label = ch ? ch.name : id.slice(0, 8);
    setChArchivingId(id);
    const { data, error } = await supabase
      .from("room_channels")
      .update({ archived: false })
      .eq("id", id)
      .select("id");
    setChArchivingId(null);
    if (error) {
      console.error("[CMD] restoreChannel error:", error);
      showToast("RESTORE FAILED: " + error.message, "err");
      return;
    }
    if (!data || data.length === 0) {
      console.error("[CMD] restoreChannel: RLS blocked or row not found for id", id);
      showToast("RESTORE BLOCKED — ensure admin role in profiles table", "err");
      return;
    }
    showToast("RESTORED: #" + label, "ok");
    await fetchData();
  }

  async function deleteChannel(id: string) {
    const ch = channels.find(c => c.id === id);
    const label = ch ? ch.name : id.slice(0, 8);
    setChConfirmDeleteId(null);
    setChDeletingId(id);
    const { data, error } = await supabase
      .from("room_channels")
      .delete()
      .eq("id", id)
      .select("id");
    setChDeletingId(null);
    if (error) {
      console.error("[CMD] deleteChannel error:", error);
      showToast("DELETE FAILED: " + error.message, "err");
      return;
    }
    if (!data || data.length === 0) {
      console.error("[CMD] deleteChannel: RLS blocked or row not found for id", id);
      showToast("DELETE BLOCKED — ensure admin role in profiles table", "err");
      return;
    }
    showToast("DELETED: #" + label, "ok");
    await fetchData();
  }

  async function renameChannel(id: string) {
    if (!chRenameVal.trim()) return;
    const { error } = await supabase.from("room_channels").update({ name: chRenameVal.trim() }).eq("id", id);
    if (error) { showToast("FAILED: " + error.message, "err"); return; }
    showToast("RENAMED", "ok"); setChRenaming(null); await fetchData();
  }

  /* ── Case ops ── */
  async function createCase() {
    const ref  = newCaseForm.ref.trim().toUpperCase();
    const name = newCaseForm.name.trim().toUpperCase();
    if (!ref)  { setCaseCreateError("REF is required"); return; }
    if (!name) { setCaseCreateError("NAME is required"); return; }
    setCaseCreating(true);
    setCaseCreateError(null);
    const { data, error } = await supabase
      .from("investigation_cases")
      .insert({
        ref, name,
        stage:       newCaseForm.stage,
        priority:    newCaseForm.priority,
        channel_id:  newCaseForm.channel_id || null,
        description: newCaseForm.description || null,
      })
      .select("id, ref");
    setCaseCreating(false);
    if (error) {
      console.error("[CMD] createCase error:", error);
      const msg = error.code === "23505"
        ? `REF ALREADY EXISTS: ${ref}`
        : error.message;
      setCaseCreateError(msg);
      showToast("FAILED: " + msg, "err");
      return;
    }
    if (!data || data.length === 0) {
      const msg = "INSERT BLOCKED — ensure your account has admin role in the DB";
      console.error("[CMD] createCase: no rows returned, RLS may be blocking");
      setCaseCreateError(msg);
      showToast("FAILED: " + msg, "err");
      return;
    }
    showToast("CASE CREATED: " + ref, "ok");
    setCaseCreateOpen(false);
    setCaseCreateError(null);
    setNewCaseForm({ ref: "", name: "", stage: "NEW", priority: "NORMAL", channel_id: "", description: "" });
    await fetchData();
  }

  async function updateCaseField(id: string, update: Record<string, string>) {
    const { error } = await supabase.from("investigation_cases").update({ ...update, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { showToast("FAILED: " + error.message, "err"); return; }
    await fetchData();
  }

  async function updateCaseMeta(
    id: string,
    update: { name: string; channel_id: string | null; description: string | null },
  ): Promise<boolean> {
    const { error } = await supabase
      .from("investigation_cases")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      console.error("[CMD] updateCaseMeta error:", error);
      showToast("FAILED: " + error.message, "err");
      return false;
    }
    await fetchData();
    return true;
  }

  async function deleteCase(id: string, ref: string) {
    const { data, error } = await supabase
      .from("investigation_cases")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) { showToast("FAILED: " + error.message, "err"); return; }
    if (!data || data.length === 0) {
      showToast("DELETE BLOCKED — RLS policy or row already gone", "err"); return;
    }
    showToast("CASE DELETED: " + ref, "ok"); await fetchData();
  }

  /* ── Message delete ── */
  async function deleteMessage(id: string) {
    const { data, error } = await supabase
      .from("room_messages")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) {
      console.error("[CMD] deleteMessage error:", error);
      showToast("DELETE FAILED: " + error.message, "err");
      return;
    }
    if (!data || data.length === 0) {
      console.error("[CMD] deleteMessage: RLS blocked or row not found", id);
      showToast("DELETE BLOCKED — RLS policy or row already gone", "err");
      return;
    }
    showToast("MESSAGE DELETED", "ok");
    setMessages(prev => prev.filter(m => m.id !== id));
  }

  /* ── Derived stats ── */
  const stats = {
    total:     operators.length,
    pending:   operators.filter(o => (o.approval_status ?? "pending") === "pending").length,
    approved:  operators.filter(o => o.approval_status === "approved").length,
    denied:    operators.filter(o => o.approval_status === "denied").length,
    suspended: operators.filter(o => o.account_status === "suspended").length,
    banned:    operators.filter(o => o.account_status === "banned").length,
    byRole: {
      admin:   operators.filter(o => o.role === "admin").length,
      lead:    operators.filter(o => o.role === "lead").length,
      analyst: operators.filter(o => o.role === "analyst").length,
      member:  operators.filter(o => o.role === "member").length,
    },
  };

  const channelActivity = messages.reduce<Record<string, number>>((acc, m) => {
    acc[m.channel_id] = (acc[m.channel_id] ?? 0) + 1; return acc;
  }, {});

  const activeChannels   = channels.filter(c => !c.archived);
  const archivedChannels = channels.filter(c => c.archived);

  const stageStyle: Record<string, string> = {
    NEW: "text-zinc-400", REVIEW: "text-amber-400", BUILDING: "text-emerald-400",
    MONITORING: "text-blue-400", READY: "text-emerald-300",
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* ── HEADER ── */}
      <div className="border-b border-zinc-900 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="font-mono text-xs tracking-[0.25em] text-zinc-300 group-hover:text-zinc-100 transition-colors">RSR INTELLIGENCE NETWORK</div>
                <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">INDEPENDENT ANALYSIS SYSTEM</div>
              </div>
            </div>
          </Link>
          <div className="w-px h-6 bg-zinc-800" />
          <div className="font-mono text-[10px] tracking-[0.4em] text-emerald-500">COMMAND CONSOLE</div>
        </div>
        <div className="flex items-center gap-6">
          {myProfile && (
            <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-600">
              {displayHandle(myProfile)} <span className="text-emerald-600">// ADMIN</span>
            </div>
          )}
          <Link href="/investigation-room">
            <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 cursor-pointer transition-colors">INVESTIGATION ROOM</span>
          </Link>
          <button onClick={signOut} className="font-mono text-[10px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 border px-5 py-3 ${toastType === "ok" ? "border-emerald-500/30 bg-black" : "border-red-500/30 bg-red-950/10"}`}>
          <div className={`font-mono text-[10px] tracking-[0.3em] ${toastType === "ok" ? "text-emerald-400" : "text-red-400"}`}>{toast}</div>
        </div>
      )}

      {/* Identity edit modal */}
      {editingOp && (
        <IdentityModal op={editingOp} onSave={saveIdentity} onClose={() => setEditingOp(null)} />
      )}

      {/* Case edit modal */}
      {caseEditTarget && (
        <CaseEditModal
          c={caseEditTarget}
          channels={channels}
          onSave={updateCaseMeta}
          onClose={() => setCaseEditTarget(null)}
        />
      )}

      {/* Brief request view modal */}
      {viewingBrief && (
        <BriefRequestModal
          req={viewingBrief}
          onStatusChange={updateBriefStatus}
          onClose={() => setViewingBrief(null)}
        />
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">

          <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.45em] text-zinc-700">
            <Link href="/" className="text-zinc-700 hover:text-zinc-400 transition-colors">← HOME</Link>
            <span className="text-zinc-800">·</span>
            <span>» RSR // COMMAND CONSOLE // SYSTEM ADMINISTRATION</span>
          </div>

          {/* ── CLEARANCE STATS ── */}
          <div>
            <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-2">CLEARANCE STATUS</div>
            <div className="grid grid-cols-5 gap-px border border-zinc-900 bg-zinc-900">
              {[
                { label: "TOTAL",              value: stats.total,                            color: "text-white" },
                { label: "PENDING",            value: stats.pending,                          color: stats.pending > 0 ? "text-amber-400" : "text-white", alert: stats.pending > 0 },
                { label: "APPROVED",           value: stats.approved,                         color: "text-emerald-400" },
                { label: "DENIED",             value: stats.denied,                           color: stats.denied > 0 ? "text-red-400" : "text-zinc-600" },
                { label: "SUSPENDED / BANNED", value: stats.suspended + stats.banned,         color: (stats.suspended + stats.banned) > 0 ? "text-red-400" : "text-zinc-600" },
              ].map(s => (
                <div key={s.label} className="bg-black px-5 py-4">
                  <div className={`font-mono text-2xl font-bold ${s.color}`}>{loading ? "—" : s.value}</div>
                  <div className={`font-mono text-[10px] tracking-[0.25em] mt-1.5 ${"alert" in s && s.alert ? "text-amber-600" : "text-zinc-600"}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── ROLE DISTRIBUTION ── */}
          <div>
            <div className="font-mono text-[9px] tracking-[0.4em] text-zinc-700 mb-2">ROLE DISTRIBUTION</div>
            <div className="grid grid-cols-4 gap-px border border-zinc-900 bg-zinc-900">
              {[
                { label: "ADMIN",   value: stats.byRole.admin,   color: "text-emerald-300" },
                { label: "LEAD",    value: stats.byRole.lead,    color: "text-blue-300" },
                { label: "ANALYST", value: stats.byRole.analyst, color: "text-zinc-300" },
                { label: "MEMBER",  value: stats.byRole.member,  color: "text-zinc-500" },
              ].map(s => (
                <div key={s.label} className="bg-black px-5 py-3">
                  <div className={`font-mono text-xl font-bold ${s.color}`}>{loading ? "—" : s.value}</div>
                  <div className="font-mono text-[10px] tracking-[0.25em] mt-1.5 text-zinc-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── OPERATOR TABLE ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-500">REGISTERED OPERATORS</div>
              <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">{stats.total} TOTAL</div>
            </div>
            <div className="border border-zinc-900">
              <div className="grid grid-cols-[1.4fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-zinc-900 bg-zinc-950">
                {["OPERATOR", "ROLE", "CLEARANCE", "ACCOUNT", "JOINED", "ACTIONS"].map(h => (
                  <div key={h} className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">{h}</div>
                ))}
              </div>

              {loading ? (
                <div className="px-5 py-8 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING OPERATORS...</div>
              ) : operators.length === 0 ? (
                <div className="px-5 py-8 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700">NO OPERATORS REGISTERED</div>
              ) : (
                operators.map(op => {
                  const isSelf     = op.id === myProfile?.id;
                  const acctStatus = op.account_status ?? "active";
                  const isExpanded = expandedOp === op.id;
                  const handle     = displayHandle(op);
                  return (
                    <div key={op.id} className={`border-b border-zinc-900/60 ${isSelf ? "bg-emerald-500/5" : acctStatus === "banned" ? "bg-red-950/10" : acctStatus === "suspended" ? "bg-amber-950/10" : ""}`}>
                      <div className="grid grid-cols-[1.4fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 items-center hover:bg-zinc-950/30 transition-colors">

                        {/* Handle + title */}
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={() => setExpandedOp(isExpanded ? null : op.id)}
                            className={`shrink-0 font-mono text-[10px] tracking-[0.15em] border px-2.5 py-1 transition-colors whitespace-nowrap ${
                              isExpanded
                                ? "text-emerald-600 border-emerald-900/50 bg-emerald-950/20"
                                : "text-zinc-600 border-zinc-800 hover:text-zinc-300 hover:border-zinc-600"
                            }`}
                          >
                            {isExpanded ? "▾ COLLAPSE" : "▸ DETAILS"}
                          </button>
                          <div className="min-w-0">
                            <div className="font-mono text-[11px] tracking-[0.12em] text-zinc-200 truncate flex items-center gap-2">
                              {handle}
                              {isSelf && <span className="text-[9px] text-emerald-600 tracking-[0.2em] shrink-0">YOU</span>}
                            </div>
                            {op.title && (
                              <div className="font-mono text-[10px] tracking-[0.06em] text-zinc-500 truncate">{op.title}</div>
                            )}
                            {op.email && (
                              <div className="font-mono text-[10px] tracking-[0.04em] text-zinc-600 truncate">{op.email}</div>
                            )}
                          </div>
                        </div>

                        <div><RoleBadge role={op.role} /></div>
                        <div><ClearanceBadge status={op.approval_status ?? "pending"} /></div>
                        <div>
                          {acctStatus === "active"
                            ? <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-600">ACTIVE</span>
                            : <AccountBadge status={acctStatus} />
                          }
                        </div>
                        <div className="font-mono text-[10px] tracking-[0.04em] text-zinc-600 whitespace-nowrap">
                          {op.created_at ? formatDate(op.created_at) : "—"}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!isSelf && (
                            <>
                              {(op.approval_status ?? "pending") !== "approved" && (
                                <ActionBtn label="APPROVE" color="emerald"
                                  loading={actionLoading === op.id + '{"approval_status":"approved"}'}
                                  disabled={!!actionLoading}
                                  onClick={() => updateProfile(op.id, { approval_status: "approved" }, "APPROVED → " + handle)} />
                              )}
                              {(op.approval_status ?? "pending") !== "denied" && (
                                <ActionBtn label="DENY" color="red"
                                  loading={actionLoading === op.id + '{"approval_status":"denied"}'}
                                  disabled={!!actionLoading}
                                  onClick={() => updateProfile(op.id, { approval_status: "denied" }, "DENIED → " + handle)} />
                              )}
                            </>
                          )}
                          <ActionBtn
                            label="EDIT IDENTITY"
                            color="zinc"
                            loading={false}
                            disabled={!!actionLoading}
                            onClick={() => setEditingOp(op)}
                          />
                        </div>
                      </div>

                      {/* Expanded controls */}
                      {isExpanded && (
                        <div className="px-10 pb-5 pt-3 border-t border-zinc-900/40 bg-zinc-950/30 space-y-4">

                          {/* Operator record */}
                          <div className="border border-zinc-900 bg-black px-4 py-3">
                            <div className="font-mono text-[9px] tracking-[0.35em] text-zinc-600 mb-3">OPERATOR RECORD</div>
                            <div className="space-y-1.5">
                              {([
                                ["ID",           op.id],
                                ["HANDLE",       displayHandle(op)],
                                ...(op.title           ? [["TITLE",          op.title]]                                    : []),
                                ["EMAIL",        op.email ?? "—"],
                                ["ROLE",         op.role.toUpperCase()],
                                ["CLEARANCE",    (op.approval_status ?? "pending").toUpperCase()],
                                ["ACCOUNT",      (op.account_status ?? "active").toUpperCase()],
                                ...(op.requested_role  ? [["REQUESTED ROLE", op.requested_role.toUpperCase()]]             : []),
                                ["JOINED",       op.created_at ? formatDate(op.created_at) : "—"],
                              ] as [string, string][]).map(([label, val]) => (
                                <div key={label} className="flex items-start gap-4 font-mono">
                                  <span className="text-[9px] tracking-[0.3em] text-zinc-700 w-32 shrink-0 pt-0.5">{label}</span>
                                  <span className="text-[10px] text-zinc-400 break-all leading-relaxed">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Identity edit */}
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-600">IDENTITY:</span>
                            <button
                              onClick={() => setEditingOp(op)}
                              className="font-mono text-[11px] tracking-[0.2em] text-zinc-400 hover:text-emerald-400 border border-zinc-700 hover:border-emerald-800/50 px-4 py-1 transition-colors"
                            >
                              EDIT HANDLE / TITLE
                            </button>
                          </div>

                          {!isSelf && (
                            <>
                              {/* Role controls */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-600 shrink-0">ROLE:</span>
                                {ROLES.map(r => (
                                  <ActionBtn key={r} label={r.toUpperCase()}
                                    color={r === op.role ? "active" : "zinc"}
                                    loading={actionLoading === op.id + `{"role":"${r}"}`}
                                    disabled={!!actionLoading || r === op.role}
                                    onClick={() => updateProfile(op.id, { role: r }, `ROLE → ${r.toUpperCase()} (${handle})`)} />
                                ))}
                              </div>

                              {/* Account status controls */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-600 shrink-0">ACCOUNT:</span>
                                {ACCT_STATUSES.map(s => (
                                  <ActionBtn key={s} label={s.toUpperCase()}
                                    color={s === acctStatus ? "active" : s === "banned" ? "red" : s === "suspended" ? "amber" : "zinc"}
                                    loading={actionLoading === op.id + `{"account_status":"${s}"}`}
                                    disabled={!!actionLoading || s === acctStatus}
                                    onClick={() => updateProfile(op.id, { account_status: s }, `ACCOUNT → ${s.toUpperCase()} (${handle})`)} />
                                ))}
                              </div>
                            </>
                          )}

                          <div className="font-mono text-[9px] text-zinc-800">ID: {op.id}</div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── ROOM ACTIVITY ── */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-500">RECENT ROOM TRANSMISSIONS</div>
                <Link href="/investigation-room">
                  <span className="font-mono text-[9px] tracking-[0.3em] text-emerald-600 hover:text-emerald-400 cursor-pointer transition-colors">→ INVESTIGATION ROOM</span>
                </Link>
              </div>
              <div className="border border-zinc-900">
                <div className="grid grid-cols-[50px_80px_1fr_80px_24px] gap-3 px-5 py-2.5 border-b border-zinc-900 bg-zinc-950">
                  {["TIME", "CHANNEL", "MESSAGE", "HANDLE", ""].map(h => (
                    <div key={h} className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">{h}</div>
                  ))}
                </div>
                {loading ? (
                  <div className="px-5 py-6 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING...</div>
                ) : messages.length === 0 ? (
                  <div className="px-5 py-6 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700">NO TRANSMISSIONS</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="group grid grid-cols-[50px_80px_1fr_80px_24px] gap-3 px-5 py-2.5 border-b border-zinc-900/30 items-start hover:bg-zinc-950/20">
                      <div className="font-mono text-[10px] text-zinc-600 pt-0.5">{formatTime(msg.created_at)}</div>
                      <div className="font-mono text-[10px] tracking-[0.1em] text-emerald-700 pt-0.5 truncate">#{msg.channel_id}</div>
                      <div className="font-mono text-[11px] text-zinc-400 leading-relaxed truncate">
                        {msg.pinned && <span className="text-emerald-800 mr-1">⊕</span>}
                        {msg.body.length > 80 ? msg.body.slice(0, 80) + "…" : msg.body}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500 pt-0.5 truncate">{msg.handle}</div>
                      <div>
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          title="Delete"
                          className="font-mono text-[10px] text-zinc-600 hover:text-red-400 transition-colors opacity-30 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-500 mb-3">CHANNEL ACTIVITY</div>
              <div className="border border-zinc-900 divide-y divide-zinc-900">
                {activeChannels.length === 0 && !loading ? (
                  <div className="px-5 py-4 font-mono text-[10px] text-zinc-700">No active channels</div>
                ) : activeChannels.map(ch => (
                  <div key={ch.id} className="flex items-center justify-between px-5 py-3">
                    <div className="font-mono text-[11px] tracking-[0.08em] text-zinc-400">
                      <span className="text-zinc-700"># </span>{ch.name}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-600">{channelActivity[ch.id] ?? 0} msg</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 border border-zinc-900 p-4">
                <div className="font-mono text-[11px] tracking-[0.3em] text-zinc-600 mb-3">SYSTEM STATUS</div>
                {[
                  { label: "INVESTIGATION ROOM", status: "LIVE" },
                  { label: "REALTIME SYNC",      status: "ACTIVE" },
                  { label: "AUTH GATEWAY",       status: "ACTIVE" },
                  { label: "APPROVAL GATE",      status: "ACTIVE" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-zinc-900/40 last:border-0">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-zinc-500">{s.label}</span>
                    <span className="font-mono text-[10px] text-emerald-600 tracking-[0.2em]">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CHANNEL MANAGEMENT ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-500">CHANNEL MANAGEMENT</div>
              <button
                onClick={() => { setChCreateOpen(v => !v); setChNewName(""); }}
                className="font-mono text-[9px] tracking-[0.3em] text-emerald-700 hover:text-emerald-500 border border-emerald-900/30 hover:border-emerald-800/40 px-3 py-1.5 transition-colors"
              >
                + NEW CHANNEL
              </button>
            </div>

            {chCreateOpen && (
              <div className="mb-4 border border-zinc-800 bg-zinc-950 p-4 flex items-center gap-3">
                <input
                  value={chNewName}
                  onChange={e => setChNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") createChannel(); if (e.key === "Escape") setChCreateOpen(false); }}
                  placeholder="channel-slug"
                  autoFocus
                  className="flex-1 bg-black border border-zinc-700 focus:border-zinc-500 font-mono text-[11px] text-zinc-300 px-3 py-2 outline-none placeholder-zinc-800 transition-colors"
                />
                <button onClick={createChannel} className="font-mono text-[10px] tracking-[0.2em] text-emerald-600 hover:text-emerald-400 border border-emerald-900/30 px-3 py-2 transition-colors">CREATE</button>
                <button onClick={() => setChCreateOpen(false)} className="font-mono text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">CANCEL</button>
              </div>
            )}

            <div className="border border-zinc-900">
              <div className="grid grid-cols-[1.5fr_70px_60px_1fr_auto] gap-4 px-5 py-2.5 border-b border-zinc-900 bg-zinc-950">
                {["NAME", "MSG", "CASES", "DESCRIPTION", "ACTIONS"].map(h => (
                  <div key={h} className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">{h}</div>
                ))}
              </div>
              {loading ? (
                <div className="px-5 py-6 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING...</div>
              ) : channels.length === 0 ? (
                <div className="px-5 py-6 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700">NO CHANNELS — create one above or run the migration SQL</div>
              ) : (
                channels.map(ch => {
                  const isRenaming = chRenaming === ch.id;
                  return (
                    <div key={ch.id} className={`border-b border-zinc-900/40 last:border-0 ${ch.archived ? "opacity-40" : ""}`}>
                      <div className="grid grid-cols-[1.5fr_70px_60px_1fr_auto] gap-4 px-5 py-3 items-center hover:bg-zinc-950/20 transition-colors">
                        <div>
                          {isRenaming ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={chRenameVal}
                                onChange={e => setChRenameVal(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") renameChannel(ch.id); if (e.key === "Escape") setChRenaming(null); }}
                                autoFocus
                                className="bg-black border border-zinc-700 font-mono text-[11px] text-zinc-300 px-2 py-1 outline-none w-36"
                              />
                              <button onClick={() => renameChannel(ch.id)} className="font-mono text-[9px] text-emerald-600 hover:text-emerald-400 transition-colors">SAVE</button>
                              <button onClick={() => setChRenaming(null)} className="font-mono text-[9px] text-zinc-600 hover:text-zinc-400 transition-colors">✕</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] tracking-[0.08em] text-zinc-400">
                                <span className="text-zinc-700"># </span>{ch.name}
                              </span>
                              {ch.archived && <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-700 border border-zinc-800 px-1">ARCHIVED</span>}
                            </div>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-zinc-600">{channelActivity[ch.id] ?? 0}</div>
                        <div className="font-mono text-[11px] text-zinc-600">{cases.filter(c => c.channel_id === ch.id).length}</div>
                        <div className="font-mono text-[11px] text-zinc-700 truncate">{ch.description ?? "—"}</div>
                        <div className="flex items-center gap-2">
                          {chConfirmDeleteId === ch.id ? (
                            /* ── Inline delete confirmation ── */
                            <>
                              <span className="font-mono text-[9px] tracking-[0.15em] text-red-400/80">CONFIRM DELETE?</span>
                              <button
                                onClick={() => deleteChannel(ch.id)}
                                disabled={chDeletingId === ch.id}
                                className="font-mono text-[10px] tracking-[0.15em] text-red-400 border border-red-900/50 hover:bg-red-950/20 px-2 py-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {chDeletingId === ch.id ? "..." : "CONFIRM"}
                              </button>
                              <button
                                onClick={() => setChConfirmDeleteId(null)}
                                className="font-mono text-[10px] tracking-[0.15em] text-zinc-600 hover:text-zinc-400 border border-zinc-800 px-2 py-0.5 transition-colors"
                              >
                                CANCEL
                              </button>
                            </>
                          ) : (
                            /* ── Normal action buttons ── */
                            <>
                              {!ch.archived && (
                                <button
                                  onClick={() => { setChRenaming(ch.id); setChRenameVal(ch.name); }}
                                  className="font-mono text-[10px] tracking-[0.15em] text-zinc-600 hover:text-zinc-400 border border-zinc-800 hover:border-zinc-700 px-2 py-0.5 transition-colors"
                                >
                                  RENAME
                                </button>
                              )}
                              {ch.archived ? (
                                <button
                                  onClick={() => restoreChannel(ch.id)}
                                  disabled={chArchivingId === ch.id}
                                  className="font-mono text-[10px] tracking-[0.15em] text-zinc-600 hover:text-emerald-500 border border-zinc-800 px-2 py-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {chArchivingId === ch.id ? "..." : "RESTORE"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => archiveChannel(ch.id)}
                                  disabled={chArchivingId === ch.id}
                                  className="font-mono text-[10px] tracking-[0.15em] text-zinc-600 hover:text-amber-400 border border-zinc-800 px-2 py-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {chArchivingId === ch.id ? "..." : "ARCHIVE"}
                                </button>
                              )}
                              <button
                                onClick={() => { setChConfirmDeleteId(ch.id); setChRenaming(null); }}
                                disabled={chDeletingId === ch.id}
                                className="font-mono text-[10px] tracking-[0.15em] text-red-900 hover:text-red-400 border border-red-950/40 hover:border-red-900/50 px-2 py-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {chDeletingId === ch.id ? "..." : "DELETE"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── CASE MANAGEMENT ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-500">CASE MANAGEMENT</div>
              <button
                onClick={() => { setCaseCreateOpen(v => !v); setNewCaseForm({ ref: "", name: "", stage: "NEW", priority: "NORMAL", channel_id: "", description: "" }); }}
                className="font-mono text-[9px] tracking-[0.3em] text-emerald-700 hover:text-emerald-500 border border-emerald-900/30 hover:border-emerald-800/40 px-3 py-1.5 transition-colors"
              >
                + NEW CASE
              </button>
            </div>

            {caseCreateOpen && (
              <div className="mb-4 border border-zinc-800 bg-zinc-950 p-5 space-y-3">
                <div className="font-mono text-[10px] tracking-[0.35em] text-zinc-600 mb-2">NEW CASE</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.3em] text-zinc-700 mb-1">REF</label>
                    <input placeholder="F-021" value={newCaseForm.ref}
                      onChange={e => setNewCaseForm(f => ({ ...f, ref: e.target.value }))}
                      className="w-full bg-black border border-zinc-800 focus:border-zinc-600 font-mono text-[11px] text-zinc-300 px-3 py-2 outline-none placeholder-zinc-800 transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.3em] text-zinc-700 mb-1">NAME</label>
                    <input placeholder="OPERATION NAME" value={newCaseForm.name}
                      onChange={e => setNewCaseForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-black border border-zinc-800 focus:border-zinc-600 font-mono text-[11px] text-zinc-300 px-3 py-2 outline-none placeholder-zinc-800 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.3em] text-zinc-700 mb-1">STAGE</label>
                    <select value={newCaseForm.stage} onChange={e => setNewCaseForm(f => ({ ...f, stage: e.target.value }))}
                      className="w-full bg-black border border-zinc-800 font-mono text-[11px] text-zinc-400 px-3 py-2 outline-none">
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.3em] text-zinc-700 mb-1">PRIORITY</label>
                    <select value={newCaseForm.priority} onChange={e => setNewCaseForm(f => ({ ...f, priority: e.target.value }))}
                      className="w-full bg-black border border-zinc-800 font-mono text-[11px] text-zinc-400 px-3 py-2 outline-none">
                      <option value="HIGH">HIGH</option>
                      <option value="NORMAL">NORMAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.3em] text-zinc-700 mb-1">CHANNEL</label>
                    <select value={newCaseForm.channel_id} onChange={e => setNewCaseForm(f => ({ ...f, channel_id: e.target.value }))}
                      className="w-full bg-black border border-zinc-800 font-mono text-[11px] text-zinc-400 px-3 py-2 outline-none">
                      <option value="">— NONE —</option>
                      {activeChannels.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.3em] text-zinc-700 mb-1">DESCRIPTION</label>
                  <input placeholder="Brief case description" value={newCaseForm.description}
                    onChange={e => setNewCaseForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-black border border-zinc-800 focus:border-zinc-600 font-mono text-[11px] text-zinc-300 px-3 py-2 outline-none placeholder-zinc-800 transition-colors" />
                </div>
                {caseCreateError && (
                  <div className="border border-red-900/40 bg-red-950/10 px-3 py-2">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-red-400">{caseCreateError}</div>
                  </div>
                )}
                <div className="flex items-center gap-4 pt-1">
                  <button
                    onClick={createCase}
                    disabled={caseCreating}
                    className="font-mono text-[10px] tracking-[0.25em] text-emerald-600 hover:text-emerald-400 border border-emerald-900/30 px-4 py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {caseCreating ? "CREATING..." : "CREATE CASE"}
                  </button>
                  <button onClick={() => { setCaseCreateOpen(false); setCaseCreateError(null); }} className="font-mono text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">CANCEL</button>
                </div>
              </div>
            )}

            <div className="border border-zinc-900">
              <div className="grid grid-cols-[70px_1fr_110px_70px_90px_1fr_100px] gap-3 px-5 py-2.5 border-b border-zinc-900 bg-zinc-950">
                {["REF", "NAME", "STAGE", "PRI", "CHANNEL", "DESCRIPTION", "ACTIONS"].map(h => (
                  <div key={h} className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">{h}</div>
                ))}
              </div>
              {loading ? (
                <div className="px-5 py-6 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING...</div>
              ) : cases.length === 0 ? (
                <div className="px-5 py-6 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700">
                  NO CASES — run the migration SQL to seed initial data, or create one above
                </div>
              ) : (
                cases.map(c => (
                  <div key={c.id} className="grid grid-cols-[70px_1fr_110px_70px_90px_1fr_100px] gap-3 px-5 py-3 border-b border-zinc-900/30 last:border-0 items-center hover:bg-zinc-950/20 transition-colors">
                    <div className="font-mono text-[10px] tracking-widest text-zinc-500">{c.ref}</div>
                    <div className="font-mono text-[11px] tracking-[0.06em] text-zinc-300 truncate">{c.name}</div>
                    <div>
                      <select value={c.stage} onChange={e => updateCaseField(c.id, { stage: e.target.value })}
                        className={`bg-black border border-zinc-800 font-mono text-[10px] px-2 py-0.5 outline-none max-w-full ${stageStyle[c.stage] ?? "text-zinc-400"}`}>
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <select value={c.priority} onChange={e => updateCaseField(c.id, { priority: e.target.value })}
                        className={`bg-black border border-zinc-800 font-mono text-[10px] px-2 py-0.5 outline-none ${c.priority === "HIGH" ? "text-red-400" : "text-zinc-500"}`}>
                        <option value="HIGH">HIGH</option>
                        <option value="NORMAL">NORMAL</option>
                      </select>
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.06em] text-emerald-700 truncate">
                      {c.channel_id ? `#${channels.find(ch => ch.id === c.channel_id)?.name ?? c.channel_id}` : "—"}
                    </div>
                    <div className="font-mono text-[10px] text-zinc-700 truncate">{c.description ?? "—"}</div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCaseEditTarget(c)}
                        className="font-mono text-[10px] text-zinc-600 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-900/30 px-2 py-0.5 transition-colors"
                      >
                        EDIT
                      </button>
                      <button onClick={() => deleteCase(c.id, c.ref)}
                        className="font-mono text-[10px] text-zinc-700 hover:text-red-400 border border-zinc-900 hover:border-red-900/30 px-2 py-0.5 transition-colors">
                        DEL
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── BRIEF REQUESTS ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] tracking-[0.45em] text-zinc-500">BRIEF REQUESTS</div>
              <div className="flex items-center gap-4">
                {briefRequests.length > 0 && (
                  <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">{briefRequests.length} TOTAL · {briefRequests.filter(r => r.status === "NEW").length} NEW</span>
                )}
              </div>
            </div>

            <div className="border border-zinc-900">
              <div className="grid grid-cols-[1fr_130px_130px_90px_90px_80px] gap-3 px-5 py-2.5 border-b border-zinc-900 bg-zinc-950">
                {["REQUESTER", "ORGANIZATION", "EMAIL", "RECEIVED", "STATUS", "ACTION"].map(h => (
                  <div key={h} className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">{h}</div>
                ))}
              </div>

              {loading ? (
                <div className="px-5 py-6 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING...</div>
              ) : briefRequests.length === 0 ? (
                <div className="px-5 py-8 text-center space-y-2">
                  <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-700">NO BRIEFING REQUESTS</div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-800">
                    Requests submitted via /briefing will appear here after you run the supabase-setup.sql schema update
                  </div>
                </div>
              ) : (
                briefRequests.map(br => (
                  <div
                    key={br.id}
                    className={`grid grid-cols-[1fr_130px_130px_90px_90px_80px] gap-3 px-5 py-3 border-b border-zinc-900/30 last:border-0 items-center hover:bg-zinc-950/20 transition-colors ${
                      br.status === "NEW" ? "bg-amber-950/5" : ""
                    }`}
                  >
                    <div>
                      <div className="font-mono text-[11px] tracking-[0.06em] text-zinc-200 truncate">{br.name}</div>
                      {br.role && <div className="font-mono text-[10px] text-zinc-600 truncate">{br.role}</div>}
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.04em] text-zinc-500 truncate">{br.organization ?? "—"}</div>
                    <div className="font-mono text-[10px] tracking-[0.04em] text-zinc-600 truncate">{br.email}</div>
                    <div className="font-mono text-[10px] text-zinc-600 whitespace-nowrap">{formatDate(br.created_at)}</div>
                    <div><BriefStatusBadge status={br.status} /></div>
                    <div>
                      <button
                        onClick={() => setViewingBrief(br)}
                        className="font-mono text-[10px] tracking-[0.15em] text-zinc-500 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-900/30 px-2 py-0.5 transition-colors"
                      >
                        OPEN →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
            <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-800">
              RSR INTELLIGENCE NETWORK // COMMAND CONSOLE // RESTRICTED ACCESS
            </div>
            <div className="flex items-center gap-6">
              <Link href="/investigation-room">
                <span className="font-mono text-[8px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 cursor-pointer transition-colors">INVESTIGATION ROOM</span>
              </Link>
              <Link href="/signal-room">
                <span className="font-mono text-[8px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 cursor-pointer transition-colors">SIGNAL ROOM</span>
              </Link>
              <Link href="/">
                <span className="font-mono text-[8px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 cursor-pointer transition-colors">HOME</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
