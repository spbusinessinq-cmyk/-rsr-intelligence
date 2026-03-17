import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth, type Profile } from "@/lib/auth";

interface MessageRow {
  id: string;
  channel_id: string;
  handle: string;
  body: string;
  created_at: string;
  role?: string;
}

type ApprovalStatus = "pending" | "approved" | "denied";
type Role = "admin" | "lead" | "analyst" | "member";
type AccountStatus = "active" | "suspended" | "banned";

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

function ClearanceBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    pending:  "text-amber-400 border-amber-500/30 bg-amber-500/5",
    denied:   "text-red-400 border-red-500/30 bg-red-500/5",
  };
  return (
    <span className={`font-mono text-[7px] tracking-[0.3em] border px-1.5 py-0.5 ${map[status] ?? "text-zinc-500 border-zinc-700"}`}>
      {status?.toUpperCase() ?? "—"}
    </span>
  );
}

function AccountBadge({ status }: { status?: string }) {
  if (!status || status === "active") return null;
  const map: Record<string, string> = {
    suspended: "text-amber-400 border-amber-500/30 bg-amber-500/5",
    banned:    "text-red-400 border-red-900/30 bg-red-900/5",
  };
  return (
    <span className={`font-mono text-[9px] tracking-[0.25em] border px-2 py-0.5 ${map[status] ?? "text-zinc-500 border-zinc-700"}`}>
      {status.toUpperCase()}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin:    "text-emerald-300 border-emerald-400/30 bg-emerald-500/5",
    lead:     "text-blue-300 border-blue-400/20 bg-blue-500/5",
    analyst:  "text-zinc-300 border-zinc-600",
    member:   "text-zinc-600 border-zinc-800",
  };
  return (
    <span className={`font-mono text-[9px] tracking-[0.25em] border px-2 py-0.5 ${map[role] ?? "text-zinc-500 border-zinc-700"}`}>
      {role?.toUpperCase() ?? "—"}
    </span>
  );
}

const ROLES: Role[] = ["member", "analyst", "lead", "admin"];

export default function Command() {
  const { profile: myProfile, signOut } = useAuth();
  const [operators, setOperators] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"ok" | "err">("ok");
  const [expandedOp, setExpandedOp] = useState<string | null>(null);

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    const [{ data: ops }, { data: msgs }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("room_messages")
        .select("id, channel_id, handle, body, created_at, role")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    if (ops) setOperators(ops as Profile[]);
    if (msgs) setMessages(msgs as MessageRow[]);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function updateProfile(id: string, update: Record<string, string>, label: string) {
    const key = id + JSON.stringify(update);
    setActionLoading(key);
    const { error } = await supabase.from("profiles").update(update).eq("id", id);
    if (error) {
      showToast("FAILED: " + error.message, "err");
    } else {
      showToast(label, "ok");
      await fetchData();
    }
    setActionLoading(null);
  }

  const stats = {
    total: operators.length,
    pending: operators.filter(o => (o.approval_status ?? "pending") === "pending").length,
    approved: operators.filter(o => o.approval_status === "approved").length,
    denied: operators.filter(o => o.approval_status === "denied").length,
    suspended: operators.filter(o => (o as any).account_status === "suspended").length,
    banned: operators.filter(o => (o as any).account_status === "banned").length,
    byRole: {
      admin: operators.filter(o => o.role === "admin").length,
      lead: operators.filter(o => o.role === "lead").length,
      analyst: operators.filter(o => o.role === "analyst").length,
      member: operators.filter(o => o.role === "member").length,
    },
  };

  const channelActivity = messages.reduce<Record<string, number>>((acc, m) => {
    acc[m.channel_id] = (acc[m.channel_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-900 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-4 cursor-pointer">
              <div className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="font-mono text-xs tracking-[0.25em] text-zinc-300">RSR INTELLIGENCE NETWORK</div>
                <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-700">INDEPENDENT ANALYSIS SYSTEM</div>
              </div>
            </div>
          </Link>
          <div className="w-px h-6 bg-zinc-800" />
          <div className="font-mono text-[9px] tracking-[0.4em] text-emerald-500">COMMAND CONSOLE</div>
        </div>
        <div className="flex items-center gap-6">
          {myProfile && (
            <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-600">
              {myProfile.handle} <span className="text-emerald-600">// ADMIN</span>
            </div>
          )}
          <Link href="/investigation-room">
            <span className="font-mono text-[8px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 cursor-pointer transition-colors">
              INVESTIGATION ROOM
            </span>
          </Link>
          <button onClick={signOut} className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors">
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 border px-5 py-3 ${toastType === "ok" ? "border-emerald-500/30 bg-black" : "border-red-500/30 bg-red-950/10"}`}>
          <div className={`font-mono text-[9px] tracking-[0.3em] ${toastType === "ok" ? "text-emerald-400" : "text-red-400"}`}>{toast}</div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">

          <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-700">
            » RSR // COMMAND CONSOLE // SYSTEM ADMINISTRATION
          </div>

          {/* ── CLEARANCE STATS ───────────────────────────────────────── */}
          <div>
            <div className="font-mono text-[8px] tracking-[0.4em] text-zinc-700 mb-2">CLEARANCE STATUS</div>
            <div className="grid grid-cols-5 gap-px border border-zinc-900 bg-zinc-900">
              {[
                { label: "TOTAL",     value: stats.total,    color: "text-white" },
                { label: "PENDING",   value: stats.pending,  color: stats.pending > 0 ? "text-amber-400" : "text-white",  alert: stats.pending > 0 },
                { label: "APPROVED",  value: stats.approved, color: "text-emerald-400" },
                { label: "DENIED",    value: stats.denied,   color: stats.denied > 0 ? "text-red-400" : "text-zinc-600" },
                { label: "SUSPENDED / BANNED", value: stats.suspended + stats.banned, color: (stats.suspended + stats.banned) > 0 ? "text-red-400" : "text-zinc-600" },
              ].map(s => (
                <div key={s.label} className="bg-black px-5 py-4">
                  <div className={`font-mono text-2xl font-bold ${s.color}`}>{loading ? "—" : s.value}</div>
                  <div className={`font-mono text-[9px] tracking-[0.25em] mt-1.5 ${s.alert ? "text-amber-600" : "text-zinc-600"}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── ROLE COUNTS ───────────────────────────────────────────── */}
          <div>
            <div className="font-mono text-[8px] tracking-[0.4em] text-zinc-700 mb-2">ROLE DISTRIBUTION</div>
            <div className="grid grid-cols-4 gap-px border border-zinc-900 bg-zinc-900">
              {[
                { label: "ADMIN",   value: stats.byRole.admin,   color: "text-emerald-300" },
                { label: "LEAD",    value: stats.byRole.lead,    color: "text-blue-300" },
                { label: "ANALYST", value: stats.byRole.analyst, color: "text-zinc-300" },
                { label: "MEMBER",  value: stats.byRole.member,  color: "text-zinc-500" },
              ].map(s => (
                <div key={s.label} className="bg-black px-5 py-3">
                  <div className={`font-mono text-xl font-bold ${s.color}`}>{loading ? "—" : s.value}</div>
                  <div className="font-mono text-[9px] tracking-[0.25em] mt-1.5 text-zinc-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── OPERATOR TABLE ────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-500">REGISTERED OPERATORS</div>
              <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-700">{stats.total} TOTAL</div>
            </div>

            <div className="border border-zinc-900">
              <div className="grid grid-cols-[1.2fr_1.5fr_auto_auto_auto_auto_auto] gap-3 px-5 py-3 border-b border-zinc-900 bg-zinc-950">
                {["HANDLE", "EMAIL", "ROLE", "CLEARANCE", "ACCOUNT", "JOINED", "ACTIONS"].map(h => (
                  <div key={h} className="font-mono text-[9px] tracking-[0.25em] text-zinc-500">{h}</div>
                ))}
              </div>

              {loading ? (
                <div className="px-5 py-8 text-center font-mono text-[9px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING OPERATORS...</div>
              ) : operators.length === 0 ? (
                <div className="px-5 py-8 text-center font-mono text-[9px] tracking-[0.3em] text-zinc-700">NO OPERATORS REGISTERED</div>
              ) : (
                operators.map(op => {
                  const isSelf = op.id === myProfile?.id;
                  const acctStatus = (op as any).account_status ?? "active";
                  const isExpanded = expandedOp === op.id;

                  return (
                    <div key={op.id} className={`border-b border-zinc-900/60 ${isSelf ? "bg-emerald-500/5" : acctStatus === "banned" ? "bg-red-950/10" : acctStatus === "suspended" ? "bg-amber-950/10" : ""}`}>
                      <div className="grid grid-cols-[1.2fr_1.5fr_auto_auto_auto_auto_auto] gap-3 px-5 py-3 items-center hover:bg-zinc-950/30 transition-colors">

                        {/* Handle */}
                        <div className="font-mono text-[10px] tracking-[0.12em] text-zinc-200 flex items-center gap-2">
                          <button
                            onClick={() => setExpandedOp(isExpanded ? null : op.id)}
                            className="text-zinc-600 hover:text-zinc-400 transition-colors"
                          >
                            {isExpanded ? "▾" : "▸"}
                          </button>
                          {op.handle}
                          {isSelf && <span className="text-[8px] text-emerald-600 tracking-[0.2em]">YOU</span>}
                        </div>

                        {/* Email */}
                        <div className="font-mono text-[10px] tracking-[0.04em] text-zinc-500 truncate">{op.email ?? "—"}</div>

                        {/* Role */}
                        <div><RoleBadge role={op.role} /></div>

                        {/* Clearance */}
                        <div><ClearanceBadge status={op.approval_status ?? "pending"} /></div>

                        {/* Account status */}
                        <div>
                          {acctStatus === "active" ? (
                            <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">ACTIVE</span>
                          ) : (
                            <AccountBadge status={acctStatus} />
                          )}
                        </div>

                        {/* Joined */}
                        <div className="font-mono text-[9px] tracking-[0.04em] text-zinc-600 whitespace-nowrap">
                          {op.created_at ? formatDate(op.created_at) : "—"}
                        </div>

                        {/* Quick actions */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!isSelf && (
                            <>
                              {(op.approval_status ?? "pending") !== "approved" && (
                                <ActionBtn
                                  label="APPROVE"
                                  color="emerald"
                                  loading={actionLoading === op.id + '{"approval_status":"approved"}'}
                                  disabled={!!actionLoading}
                                  onClick={() => updateProfile(op.id, { approval_status: "approved" }, "APPROVED → " + op.handle)}
                                />
                              )}
                              {(op.approval_status ?? "pending") !== "denied" && (
                                <ActionBtn
                                  label="DENY"
                                  color="red"
                                  loading={actionLoading === op.id + '{"approval_status":"denied"}'}
                                  disabled={!!actionLoading}
                                  onClick={() => updateProfile(op.id, { approval_status: "denied" }, "DENIED → " + op.handle)}
                                />
                              )}
                            </>
                          )}
                          {isSelf && <span className="font-mono text-[9px] text-zinc-800 tracking-[0.2em]">—</span>}
                        </div>
                      </div>

                      {/* Expanded operator panel */}
                      {isExpanded && !isSelf && (
                        <div className="px-10 pb-4 pt-1 border-t border-zinc-900/40 bg-zinc-950/30">
                          <div className="flex flex-wrap gap-3 items-center">
                            {/* Role control */}
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] tracking-[0.25em] text-zinc-600">ROLE:</span>
                              {ROLES.map(r => (
                                <ActionBtn
                                  key={r}
                                  label={r.toUpperCase()}
                                  color={r === op.role ? "active" : "zinc"}
                                  loading={actionLoading === op.id + `{"role":"${r}"}`}
                                  disabled={!!actionLoading || r === op.role}
                                  onClick={() => updateProfile(op.id, { role: r }, `ROLE → ${r.toUpperCase()} (${op.handle})`)}
                                />
                              ))}
                            </div>

                            <div className="w-px h-4 bg-zinc-800 mx-1" />

                            {/* Account status control */}
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] tracking-[0.25em] text-zinc-600">ACCOUNT:</span>
                              {(["active", "suspended", "banned"] as AccountStatus[]).map(s => (
                                <ActionBtn
                                  key={s}
                                  label={s.toUpperCase()}
                                  color={s === acctStatus ? "active" : s === "banned" ? "red" : s === "suspended" ? "amber" : "zinc"}
                                  loading={actionLoading === op.id + `{"account_status":"${s}"}`}
                                  disabled={!!actionLoading || s === acctStatus}
                                  onClick={() => updateProfile(op.id, { account_status: s }, `ACCOUNT → ${s.toUpperCase()} (${op.handle})`)}
                                />
                              ))}
                            </div>

                            <div className="ml-auto">
                              <span className="font-mono text-[9px] tracking-[0.15em] text-zinc-700">
                                ID: {op.id.slice(0, 8)}...
                              </span>
                            </div>
                          </div>

                          {/* Recent messages by this operator */}
                          <OpActivity handle={op.handle} messages={messages} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── ROOM ACTIVITY ─────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Message log */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-500">RECENT ROOM TRANSMISSIONS</div>
                <Link href="/investigation-room">
                  <span className="font-mono text-[8px] tracking-[0.3em] text-emerald-600 hover:text-emerald-400 cursor-pointer transition-colors">
                    → INVESTIGATION ROOM
                  </span>
                </Link>
              </div>
              <div className="border border-zinc-900">
                <div className="grid grid-cols-[60px_90px_1fr_90px] gap-3 px-5 py-2.5 border-b border-zinc-900 bg-zinc-950">
                  {["TIME", "CHANNEL", "MESSAGE", "HANDLE"].map(h => (
                    <div key={h} className="font-mono text-[9px] tracking-[0.25em] text-zinc-500">{h}</div>
                  ))}
                </div>
                {loading ? (
                  <div className="px-5 py-6 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700 animate-pulse">LOADING...</div>
                ) : messages.length === 0 ? (
                  <div className="px-5 py-6 text-center font-mono text-[10px] tracking-[0.3em] text-zinc-700">NO TRANSMISSIONS</div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="grid grid-cols-[60px_90px_1fr_90px] gap-3 px-5 py-2.5 border-b border-zinc-900/30 items-start hover:bg-zinc-950/20">
                      <div className="font-mono text-[9px] text-zinc-600 pt-0.5">{formatTime(msg.created_at)}</div>
                      <div className="font-mono text-[9px] tracking-[0.1em] text-emerald-700 pt-0.5 truncate">#{msg.channel_id}</div>
                      <div className="font-mono text-[10px] text-zinc-400 leading-relaxed truncate">
                        {msg.body.length > 100 ? msg.body.slice(0, 100) + "…" : msg.body}
                      </div>
                      <div className="font-mono text-[9px] text-zinc-500 pt-0.5 truncate">{msg.handle}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Channel snapshot */}
            <div>
              <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-500 mb-3">CHANNEL ACTIVITY</div>
              <div className="border border-zinc-900 divide-y divide-zinc-900">
                {["general", "investigations", "west-coast-case", "signals", "off-grid"].map(ch => (
                  <div key={ch} className="flex items-center justify-between px-5 py-3">
                    <div className="font-mono text-[10px] tracking-[0.08em] text-zinc-400">
                      <span className="text-zinc-700"># </span>{ch}
                    </div>
                    <div className="font-mono text-[10px] text-zinc-600">
                      {channelActivity[ch] ?? 0} msg
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border border-zinc-900 p-4">
                <div className="font-mono text-[10px] tracking-[0.3em] text-zinc-600 mb-3">SYSTEM STATUS</div>
                {[
                  { label: "INVESTIGATION ROOM", status: "LIVE" },
                  { label: "REALTIME SYNC", status: "ACTIVE" },
                  { label: "AUTH GATEWAY", status: "ACTIVE" },
                  { label: "APPROVAL GATE", status: "ACTIVE" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-zinc-900/40 last:border-0">
                    <span className="font-mono text-[9px] tracking-[0.12em] text-zinc-500">{s.label}</span>
                    <span className="font-mono text-[9px] text-emerald-600 tracking-[0.2em]">{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
            <div className="font-mono text-[7px] tracking-[0.3em] text-zinc-800">
              RSR INTELLIGENCE NETWORK // COMMAND CONSOLE // RESTRICTED ACCESS
            </div>
            <div className="flex items-center gap-6">
              <Link href="/investigation-room">
                <span className="font-mono text-[7px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 cursor-pointer transition-colors">INVESTIGATION ROOM</span>
              </Link>
              <Link href="/signal-room">
                <span className="font-mono text-[7px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 cursor-pointer transition-colors">SIGNAL ROOM</span>
              </Link>
              <Link href="/">
                <span className="font-mono text-[7px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 cursor-pointer transition-colors">HOME</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

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
    <button
      disabled={disabled}
      onClick={onClick}
      className={`font-mono text-[9px] tracking-[0.2em] border px-2 py-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
    >
      {loading ? "..." : label}
    </button>
  );
}

function OpActivity({ handle, messages }: { handle: string; messages: MessageRow[] }) {
  const opMsgs = messages.filter(m => m.handle === handle).slice(0, 3);
  if (opMsgs.length === 0) return (
    <div className="mt-3 font-mono text-[9px] tracking-[0.2em] text-zinc-700">NO RECENT TRANSMISSIONS</div>
  );
  return (
    <div className="mt-3 space-y-1.5">
      <div className="font-mono text-[9px] tracking-[0.25em] text-zinc-600 mb-2">RECENT TRANSMISSIONS:</div>
      {opMsgs.map(m => (
        <div key={m.id} className="flex gap-3 items-start">
          <span className="font-mono text-[9px] text-zinc-600 shrink-0">{formatTime(m.created_at)}</span>
          <span className="font-mono text-[9px] text-emerald-800 shrink-0">#{m.channel_id}</span>
          <span className="font-mono text-[10px] text-zinc-500 leading-relaxed truncate">
            {m.body.slice(0, 90)}{m.body.length > 90 ? "…" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
