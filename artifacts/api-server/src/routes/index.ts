import { Router, type IRouter } from "express";
import healthRouter                    from "./health";
import sageRouter                      from "./sage";
import newsRouter                      from "./news";
import statusRouter                    from "./status";
import investigationStatusRouter       from "./investigation-status";
import investigationChatStatusRouter   from "./investigation-chat-status";
import investigationChatRecentRouter   from "./investigation-chat-recent";
import investigationPresenceRouter     from "./investigation-presence";
import investigationAdminRouter        from "./investigation-admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sageRouter);
router.use(newsRouter);
router.use(statusRouter);
router.use(investigationStatusRouter);
router.use(investigationChatStatusRouter);
router.use(investigationChatRecentRouter);
router.use(investigationPresenceRouter);
router.use(investigationAdminRouter);

export default router;
