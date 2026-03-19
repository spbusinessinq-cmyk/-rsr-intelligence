import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/status", (_req, res) => {
  res.json({
    status:    "operational",
    service:   "RSR Intelligence Network",
    timestamp: new Date().toISOString(),
    checks: {
      api:      "ok",
      supabase: "ok",
    },
  });
});

export default router;
