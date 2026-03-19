import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SB_URL = process.env["VITE_SUPABASE_URL"]        ?? "";
const SB_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
const CONFIGURED = Boolean(SB_URL && SB_KEY);

const SB_HEADERS = {
  "apikey":        SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
};

async function sbCount(filter: string): Promise<{ count: number; ok: boolean; error?: string }> {
  const raw = await fetch(`${SB_URL}/rest/v1/profiles?select=id&${filter}`, { headers: SB_HEADERS });
  if (!raw.ok) return { count: 0, ok: false, error: `HTTP ${raw.status}` };
  const rows = await raw.json() as unknown[];
  return { count: Array.isArray(rows) ? rows.length : 0, ok: true };
}

router.get("/investigation-admin", async (_req, res) => {
  const timestamp = new Date().toISOString();

  if (!CONFIGURED) {
    return res.json({
      ok: false,
      status: "supabase-not-configured",
      moderationPending: 0,
      flagsOpen: 0,
      notes: "No Supabase configuration. Counts unavailable.",
      timestamp,
    });
  }

  const [pendingRes, suspendedRes, bannedRes] = await Promise.allSettled([
    sbCount("approval_status=eq.pending"),
    sbCount("account_status=eq.suspended"),
    sbCount("account_status=eq.banned"),
  ]);

  const pending   = pendingRes.status   === "fulfilled" ? pendingRes.value   : { count: 0, ok: false };
  const suspended = suspendedRes.status === "fulfilled" ? suspendedRes.value : { count: 0, ok: false };
  const banned    = bannedRes.status    === "fulfilled" ? bannedRes.value    : { count: 0, ok: false };

  const allOk = pending.ok && suspended.ok && banned.ok;

  return res.json({
    ok: allOk,
    status: allOk ? "operational" : "partial-data",
    moderationPending: pending.count,
    flagsOpen: suspended.count + banned.count,
    notes: "flagsOpen = suspended + banned profile count. No separate flags table exists in this deployment.",
    timestamp,
  });
});

export default router;
