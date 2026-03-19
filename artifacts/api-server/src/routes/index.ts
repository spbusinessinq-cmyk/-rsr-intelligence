import { Router, type IRouter } from "express";
import healthRouter              from "./health";
import sageRouter                from "./sage";
import newsRouter                from "./news";
import statusRouter              from "./status";
import investigationStatusRouter from "./investigation-status";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sageRouter);
router.use(newsRouter);
router.use(statusRouter);
router.use(investigationStatusRouter);

export default router;
