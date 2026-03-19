// cloud-functions/api/investigation-chat-status.js
// EdgeOne Node Function — route: GET /api/investigation-chat-status
// High-level Investigation Room / chat status from live Supabase data.

const SB_URL = process.env.VITE_SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const CONFIGURED = Boolean(SB_URL && SB_KEY);

const HEADERS = {
  "apikey": SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
};

async function sbFetch(table, qs) {
  const res = await fetch(`${SB_URL}/rest/v1/${table}?${qs}`, { headers: HEADERS });
  if (!res.ok) return { rows: [], ok: false, error: `HTTP ${res.status}` };
  const rows = await res.json();
  return { rows, ok: true };
}

const onRequestGet = async () => {
  const timestamp = new Date().toISOString();

  if (!CONFIGURED) {
    return new Response(JSON.stringify({
      ok: false,
      status: "supabase-not-configured",
      room: { reachable: false, authRequired: true, roomId: "investigation-room" },
      metrics: { usersOnline: 0, recentMessageCount: 0, moderationPending: 0 },
      timestamp,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    });
  }

  const since24h = new Date(Date.now() - 86400 * 1000).toISOString();

  const [channelsRes, recentRes, approvedRes, pendingRes] = await Promise.allSettled([
    sbFetch("room_channels", "select=id&archived=eq.false"),
    sbFetch("room_messages", `select=id&created_at=gte.${encodeURIComponent(since24h)}`),
    sbFetch("profiles",      "select=id&approval_status=eq.approved"),
    sbFetch("profiles",      "select=id&approval_status=eq.pending"),
  ]);

  const channels  = channelsRes.status  === "fulfilled" ? channelsRes.value  : { rows: [], ok: false, error: "promise rejected" };
  const recent    = recentRes.status    === "fulfilled" ? recentRes.value    : { rows: [], ok: false };
  const approved  = approvedRes.status  === "fulfilled" ? approvedRes.value  : { rows: [], ok: false };
  const pending   = pendingRes.status   === "fulfilled" ? pendingRes.value   : { rows: [], ok: false };

  const reachable = channels.ok;

  const body = JSON.stringify({
    ok: reachable,
    status: reachable ? "operational" : `unreachable — ${channels.error ?? "unknown error"}`,
    room: {
      reachable,
      authRequired: true,
      roomId: "investigation-room",
    },
    metrics: {
      usersOnline:        approved.rows.length,
      recentMessageCount: recent.rows.length,
      moderationPending:  pending.rows.length,
    },
    timestamp,
  });

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
  });
};

export default onRequestGet;
