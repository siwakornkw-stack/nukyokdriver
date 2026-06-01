import { Router } from "express";
import { requireUser, validateRequest } from '../middlewares'
import * as memberController from './member.controllers'
import { paramsWithIdSchema } from "../interfaces/ParamsWithId";

const router = Router();

// router.get('/find-all/:id', requireUser, memberController.FindAllMemberByAgentId)
router.post(
    '/user',
    requireUser,
    memberController.user
)

router.get(
  '/check-line',
  requireUser,
  memberController.checkLine
)

export default router;