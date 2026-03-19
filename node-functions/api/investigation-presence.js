// cloud-functions/api/investigation-presence.js
// EdgeOne Node Function — route: GET /api/investigation-presence
// Returns approved operator roster as presence proxy.
// NOTE: No real-time presence tracking table exists in this deployment.
// Supabase Realtime presence is ephemeral and server-unreadable.
// This endpoint returns approved operators (handles + roles only, no emails, no IDs).

const SB_URL = process.env.VITE_SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const CONFIGURED = Boolean(SB_URL && SB_KEY);

const HEADERS = {
  "apikey": SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
};

const onRequestGet = async () => {
  const timestamp = new Date().toISOString();

  if (!CONFIGURED) {
    return new Response(JSON.stringify({
      ok: false,
      status: "supabase-not-configured — count-only, no real-time presence tracking",
      usersOnline: 0,
      users: [],
      timestamp,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    });
  }

  const qs = "select=handle,role,created_at&approval_status=eq.approved&account_status=eq.active&order=created_at.asc";
  const res = await fetch(`${SB_URL}/rest/v1/profiles?${qs}`, { headers: HEADERS });

  if (!res.ok) {
    return new Response(JSON.stringify({
      ok: false,
      status: `supabase-error — HTTP ${res.status} — count-only, no real-time presence tracking`,
      usersOnline: 0,
      users: [],
      timestamp,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    });
  }

  const rows = await res.json();

  const users = rows.map(row => ({
    alias:     row.handle ?? "UNKNOWN",
    role:      row.role   ?? "member",
    presentAt: row.created_at,
  }));

  return new Response(JSON.stringify({
    ok: true,
    status: "count-only — no real-time presence tracking; showing approved active operators",
    usersOnline: users.length,
    users,
    timestamp,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
  });
};

export { onRequestGet };
