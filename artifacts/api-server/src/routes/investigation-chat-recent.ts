import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SB_URL = process.env["VITE_SUPABASE_URL"]        ?? "";
const SB_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
const CONFIGURED = Boolean(SB_URL && SB_KEY);

const SB_HEADERS = {
  "apikey":        SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
};

const PREVIEW_LEN = 120;

function preview(body: string | null): string {
  if (!body) return "";
  const clean = body.replace(/\[(F|D)-\d{3}\]/g, "").trim();
  return clean.length > PREVIEW_LEN ? clean.slice(0, PREVIEW_LEN) + "…" : clean;
}

interface MsgRow {
  id:         string;
  handle:     string | null;
  body:       string | null;
  created_at: string;
}

router.get("/investigation-chat-recent", async (_req, res) => {
  const timestamp = new Date().toISOString();

  if (!CONFIGURED) {
    return res.json({
      ok: false,
      status: "supabase-not-configured",
      messages: [],
      timestamp,
    });
  }

  const qs = "select=id,handle,body,created_at&order=created_at.desc&limit=20";
  const raw = await fetch(`${SB_URL}/rest/v1/room_messages?${qs}`, { headers: SB_HEADERS });

  if (!raw.ok) {
    return res.json({
      ok: false,
      status: `supabase-error — HTTP ${raw.status}`,
      messages: [],
      timestamp,
    });
  }

  const rows = await raw.json() as MsgRow[];

  const messages = rows.map(row => ({
    id:        row.id,
    author:    row.handle    ?? "UNKNOWN",
    preview:   preview(row.body),
    createdAt: row.created_at,
  }));

  return res.json({
    ok: true,
    status: "operational",
    messages,
    timestamp,
  });
});

export default router;
