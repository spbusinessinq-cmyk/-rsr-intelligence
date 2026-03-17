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
}

type ApprovalStatus = "pending" | "approved" | "denied";
type Role = "admin" | "member";

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    pending: "text-amber-400 border-amber-500/30 bg-amber-500/5",
    denied: "text-red-400 border-red-500/30 bg-red-500/5",
  };
  return (
    <span className={`font-mono text-[8px] tracking-[0.3em] border px-2 py-0.5 ${map[status] ?? "text-zinc-500 border-zinc-700"}`}>
      {status.toUpperCase()}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`font-mono text-[8px] tracking-[0.3em] border px-2 py-0.5 ${role === "admin" ? "text-emerald-300 border-emerald-400/30 bg-emerald-500/5" : "text-zinc-500 border-zinc-700"}`}>
      {role.toUpperCase()}
    </span>
  );
}

export default function Command() {
  const { profile: myProfile, signOut } = useAuth();
  const [operators, setOperators] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    const [{ data: ops }, { data: msgs }] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("room_messages")
        .select("id, channel_id, handle, body, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
    ]);
    if (ops) setOperators(ops as Profile[]);
    if (msgs) setMessages(msgs as MessageRow[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function setApproval(id: string, status: ApprovalStatus) {
    setActionLoading(id + status);
    const { error } = await supabase
      .from("profiles")
      .update({ approval_status: status })
      .eq("id", id);
    if (error) {
      showToast("UPDATE FAILED: " + error.message);
    } else {
      showToast("STATUS UPDATED → " + status.toUpperCase());
      await fetchData();
    }
    setActionLoading(null);
  }

  async function setRole(id: string, role: Role) {
    setActionLoading(id + role);
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id);
    if (error) {
      showToast("UPDATE FAILED: " + error.message);
    } else {
      showToast("ROLE UPDATED → " + role.toUpperCase());
      await fetchData();
    }
    setActionLoading(null);
  }

  const stats = {
    total: operators.length,
    pending: operators.filter(o => o.approval_status === "pending").length,
    approved: operators.filter(o => o.approval_status === "approved").length,
    denied: operators.filter(o => o.approval_status === "denied").length,
    admins: operators.filter(o => o.role === "admin").length,
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
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
          <button
            onClick={signOut}
            className="font-mono text-[9px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 border border-emerald-500/30 bg-black px-5 py-3">
          <div className="font-mono text-[9px] tracking-[0.3em] text-emerald-400">{toast}</div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">

          {/* Breadcrumb */}
          <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-700">
            » RSR // COMMAND CONSOLE // SYSTEM ADMINISTRATION
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-5 gap-px border border-zinc-900 bg-zinc-900">
            {[
              { label: "TOTAL OPERATORS", value: stats.total },
              { label: "PENDING CLEARANCE", value: stats.pending, alert: stats.pending > 0 },
              { label: "APPROVED", value: stats.approved },
              { label: "DENIED", value: stats.denied },
              { label: "ADMIN ROLES", value: stats.admins },
            ].map(s => (
              <div key={s.label} className="bg-black px-5 py-4">
                <div className={`font-mono text-xl font-bold ${s.alert ? "text-amber-400" : "text-white"}`}>
                  {loading ? "—" : s.value}
                </div>
                <div className={`font-mono text-[8px] tracking-[0.3em] mt-1 ${s.alert ? "text-amber-600" : "text-zinc-700"}`}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Operator table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-500">
                REGISTERED OPERATORS
              </div>
              <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-700">
                {stats.total} TOTAL
              </div>
            </div>

            <div className="border border-zinc-900">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1.5fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-zinc-900 bg-zinc-950">
                {["HANDLE", "EMAIL", "ROLE", "CLEARANCE", "JOINED", "ACTIONS"].map(h => (
                  <div key={h} className="font-mono text-[8px] tracking-[0.35em] text-zinc-600">{h}</div>
                ))}
              </div>

              {loading ? (
                <div className="px-5 py-8 text-center font-mono text-[9px] tracking-[0.3em] text-zinc-700 animate-pulse">
                  LOADING OPERATORS...
                </div>
              ) : operators.length === 0 ? (
                <div className="px-5 py-8 text-center font-mono text-[9px] tracking-[0.3em] text-zinc-700">
                  NO OPERATORS REGISTERED
                </div>
              ) : (
                operators.map((op, i) => {
                  const isSelf = op.id === myProfile?.id;
                  const busy = (k: string) => actionLoading === op.id + k;
                  return (
                    <div
                      key={op.id}
                      className={`grid grid-cols-[1fr_1.5fr_auto_auto_auto_auto] gap-4 px-5 py-3 items-center border-b border-zinc-900/60 hover:bg-zinc-950/50 transition-colors ${isSelf ? "bg-emerald-500/5" : ""}`}
                    >
                      {/* Handle */}
                      <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-300">
                        {op.handle}
                        {isSelf && <span className="ml-2 text-[7px] text-emerald-600 tracking-[0.2em]">YOU</span>}
                      </div>

                      {/* Email */}
                      <div className="font-mono text-[8px] tracking-[0.1em] text-zinc-600 truncate">
                        {op.email ?? "—"}
                      </div>

                      {/* Role */}
                      <div><RoleBadge role={op.role} /></div>

                      {/* Status */}
                      <div><StatusBadge status={op.approval_status ?? "pending"} /></div>

                      {/* Joined */}
                      <div className="font-mono text-[8px] tracking-[0.1em] text-zinc-700 whitespace-nowrap">
                        {op.created_at ? formatDate(op.created_at) : "—"}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {!isSelf && (
                          <>
                            {op.approval_status !== "approved" && (
                              <button
                                disabled={!!actionLoading}
                                onClick={() => setApproval(op.id, "approved")}
                                className="font-mono text-[7px] tracking-[0.25em] text-emerald-500 border border-emerald-500/20 px-2 py-0.5 hover:bg-emerald-500/10 transition-colors disabled:opacity-40"
                              >
                                {busy("approved") ? "..." : "APPROVE"}
                              </button>
                            )}
                            {op.approval_status !== "denied" && (
                              <button
                                disabled={!!actionLoading}
                                onClick={() => setApproval(op.id, "denied")}
                                className="font-mono text-[7px] tracking-[0.25em] text-red-500 border border-red-500/20 px-2 py-0.5 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                              >
                                {busy("denied") ? "..." : "DENY"}
                              </button>
                            )}
                            {op.role !== "admin" && (
                              <button
                                disabled={!!actionLoading}
                                onClick={() => setRole(op.id, "admin")}
                                className="font-mono text-[7px] tracking-[0.25em] text-zinc-400 border border-zinc-700 px-2 py-0.5 hover:bg-zinc-900 transition-colors disabled:opacity-40"
                              >
                                {busy("admin") ? "..." : "→ ADMIN"}
                              </button>
                            )}
                            {op.role !== "member" && (
                              <button
                                disabled={!!actionLoading}
                                onClick={() => setRole(op.id, "member")}
                                className="font-mono text-[7px] tracking-[0.25em] text-zinc-600 border border-zinc-800 px-2 py-0.5 hover:bg-zinc-900 transition-colors disabled:opacity-40"
                              >
                                {busy("member") ? "..." : "→ MEMBER"}
                              </button>
                            )}
                          </>
                        )}
                        {isSelf && (
                          <span className="font-mono text-[7px] tracking-[0.2em] text-zinc-700">NO SELF-EDIT</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent room activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[9px] tracking-[0.45em] text-zinc-500">
                RECENT ROOM ACTIVITY
              </div>
              <Link href="/investigation-room">
                <span className="font-mono text-[8px] tracking-[0.3em] text-emerald-600 hover:text-emerald-400 cursor-pointer transition-colors">
                  → INVESTIGATION ROOM
                </span>
              </Link>
            </div>

            <div className="border border-zinc-900">
              <div className="grid grid-cols-[auto_auto_1fr_auto] gap-4 px-5 py-3 border-b border-zinc-900 bg-zinc-950">
                {["TIME", "CHANNEL", "MESSAGE", "HANDLE"].map(h => (
                  <div key={h} className="font-mono text-[8px] tracking-[0.35em] text-zinc-600">{h}</div>
                ))}
              </div>
              {loading ? (
                <div className="px-5 py-6 text-center font-mono text-[9px] tracking-[0.3em] text-zinc-700 animate-pulse">
                  LOADING ACTIVITY...
                </div>
              ) : messages.length === 0 ? (
                <div className="px-5 py-6 text-center font-mono text-[9px] tracking-[0.3em] text-zinc-700">
                  NO ACTIVITY RECORDED
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="grid grid-cols-[auto_auto_1fr_auto] gap-4 px-5 py-2.5 border-b border-zinc-900/40 items-start">
                    <div className="font-mono text-[8px] tracking-[0.1em] text-zinc-700 whitespace-nowrap pt-0.5">
                      {formatTime(msg.created_at)}
                    </div>
                    <div className="font-mono text-[8px] tracking-[0.15em] text-emerald-700 whitespace-nowrap pt-0.5">
                      #{msg.channel_id}
                    </div>
                    <div className="font-mono text-[9px] tracking-[0.05em] text-zinc-500 leading-relaxed truncate">
                      {msg.body.length > 120 ? msg.body.slice(0, 120) + "…" : msg.body}
                    </div>
                    <div className="font-mono text-[8px] tracking-[0.15em] text-zinc-600 whitespace-nowrap pt-0.5">
                      {msg.handle}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
            <div className="font-mono text-[8px] tracking-[0.3em] text-zinc-800">
              RSR INTELLIGENCE NETWORK // COMMAND CONSOLE // RESTRICTED ACCESS
            </div>
            <div className="flex items-center gap-6">
              <Link href="/investigation-room">
                <span className="font-mono text-[8px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 cursor-pointer transition-colors">
                  INVESTIGATION ROOM
                </span>
              </Link>
              <Link href="/">
                <span className="font-mono text-[8px] tracking-[0.3em] text-zinc-700 hover:text-zinc-400 cursor-pointer transition-colors">
                  HOME
                </span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
