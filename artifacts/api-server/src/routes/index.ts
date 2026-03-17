import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sageRouter from "./sage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sageRouter);

export default router;
