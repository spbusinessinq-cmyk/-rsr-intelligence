// cloud-functions/api/investigation-admin.js
// EdgeOne Node Function — route: GET /api/investigation-admin
// Returns moderation/admin queue summary — counts only, no content exposure.
// NOTE: No separate flags table exists. flagsOpen is derived from profiles
// with account_status = suspended or banned.

const SB_URL = process.env.VITE_SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const CONFIGURED = Boolean(SB_URL && SB_KEY);

const HEADERS = {
  "apikey": SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
};

async function sbCount(table, qs) {
  const res = await fetch(`${SB_URL}/rest/v1/${table}?select=id&${qs}`, { headers: HEADERS });
  if (!res.ok) return { count: 0, ok: false, error: `HTTP ${res.status}` };
  const rows = await res.json();
  return { count: Array.isArray(rows) ? rows.length : 0, ok: true };
}

const onRequestGet = async () => {
  const timestamp = new Date().toISOString();

  if (!CONFIGURED) {
    return new Response(JSON.stringify({
      ok: false,
      status: "supabase-not-configured",
      moderationPending: 0,
      flagsOpen: 0,
      notes: "No Supabase configuration. Counts unavailable.",
      timestamp,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    });
  }

  const [pendingRes, suspendedRes, bannedRes] = await Promise.allSettled([
    sbCount("profiles", "approval_status=eq.pending"),
    sbCount("profiles", "account_status=eq.suspended"),
    sbCount("profiles", "account_status=eq.banned"),
  ]);

  const pending   = pendingRes.status   === "fulfilled" ? pendingRes.value   : { count: 0, ok: false };
  const suspended = suspendedRes.status === "fulfilled" ? suspendedRes.value : { count: 0, ok: false };
  const banned    = bannedRes.status    === "fulfilled" ? bannedRes.value    : { count: 0, ok: false };

  const allOk = pending.ok && suspended.ok && banned.ok;

  return new Response(JSON.stringify({
    ok: allOk,
    status: allOk ? "operational" : "partial-data",
    moderationPending: pending.count,
    flagsOpen: suspended.count + banned.count,
    notes: "flagsOpen = suspended + banned profile count. No separate flags table exists in this deployment.",
    timestamp,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
  });
};

export { onRequestGet };
