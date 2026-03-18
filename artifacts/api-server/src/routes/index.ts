import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sageRouter from "./sage";
import newsRouter from "./news";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sageRouter);
router.use(newsRouter);

export default router;
