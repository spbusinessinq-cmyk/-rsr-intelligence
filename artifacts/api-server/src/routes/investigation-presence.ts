import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SB_URL = process.env["VITE_SUPABASE_URL"]        ?? "";
const SB_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
const CONFIGURED = Boolean(SB_URL && SB_KEY);

const SB_HEADERS = {
  "apikey":        SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
};

interface ProfileRow {
  handle:     string | null;
  role:       string | null;
  created_at: string;
}

router.get("/investigation-presence", async (_req, res) => {
  const timestamp = new Date().toISOString();

  if (!CONFIGURED) {
    return res.json({
      ok: false,
      status: "supabase-not-configured — count-only, no real-time presence tracking",
      usersOnline: 0,
      users: [],
      timestamp,
    });
  }

  const qs = "select=handle,role,created_at&approval_status=eq.approved&account_status=eq.active&order=created_at.asc";
  const raw = await fetch(`${SB_URL}/rest/v1/profiles?${qs}`, { headers: SB_HEADERS });

  if (!raw.ok) {
    return res.json({
      ok: false,
      status: `supabase-error — HTTP ${raw.status} — count-only, no real-time presence tracking`,
      usersOnline: 0,
      users: [],
      timestamp,
    });
  }

  const rows = await raw.json() as ProfileRow[];

  const users = rows.map(row => ({
    alias:     row.handle ?? "UNKNOWN",
    role:      row.role   ?? "member",
    presentAt: row.created_at,
  }));

  return res.json({
    ok: true,
    status: "count-only — no real-time presence tracking; showing approved active operators",
    usersOnline: users.length,
    users,
    timestamp,
  });
});

export default router;
