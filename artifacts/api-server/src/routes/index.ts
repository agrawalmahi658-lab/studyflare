import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import matchingRouter from "./matching";
import sessionsRouter from "./sessions";
import groupsRouter from "./groups";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(matchingRouter);
router.use(sessionsRouter);
router.use(groupsRouter);

export default router;
