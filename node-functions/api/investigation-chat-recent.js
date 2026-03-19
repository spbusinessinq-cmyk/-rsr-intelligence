// cloud-functions/api/investigation-chat-recent.js
// EdgeOne Node Function — route: GET /api/investigation-chat-recent
// Returns recent message metadata only — no full bodies, no private tokens.

const SB_URL = process.env.VITE_SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const CONFIGURED = Boolean(SB_URL && SB_KEY);

const HEADERS = {
  "apikey": SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
};

const PREVIEW_LEN = 120;

function preview(body) {
  if (!body) return "";
  const clean = body.replace(/\[(F|D)-\d{3}\]/g, "").trim();
  return clean.length > PREVIEW_LEN ? clean.slice(0, PREVIEW_LEN) + "…" : clean;
}

const onRequestGet = async () => {
  const timestamp = new Date().toISOString();

  if (!CONFIGURED) {
    return new Response(JSON.stringify({
      ok: false,
      status: "supabase-not-configured",
      messages: [],
      timestamp,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    });
  }

  const qs = "select=id,handle,body,created_at&order=created_at.desc&limit=20";
  const res = await fetch(`${SB_URL}/rest/v1/room_messages?${qs}`, { headers: HEADERS });

  if (!res.ok) {
    return new Response(JSON.stringify({
      ok: false,
      status: `supabase-error — HTTP ${res.status}`,
      messages: [],
      timestamp,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    });
  }

  const rows = await res.json();

  const messages = rows.map(row => ({
    id:        row.id,
    author:    row.handle ?? "UNKNOWN",
    preview:   preview(row.body),
    createdAt: row.created_at,
  }));

  return new Response(JSON.stringify({
    ok: true,
    status: "operational",
    messages,
    timestamp,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
  });
};

export { onRequestGet };
