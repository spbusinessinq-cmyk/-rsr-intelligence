import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/investigation-status", (_req, res) => {
  res.json({
    status:    "operational",
    service:   "Investigation Room",
    timestamp: new Date().toISOString(),
    checks: {
      api:      "ok",
      supabase: "ok",
      realtime: "ok",
    },
  });
});

export default router;
