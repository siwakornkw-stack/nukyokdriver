
import { Router } from 'express'
import { paramsWithIdSchema } from '../interfaces/ParamsWithId'
import { requireUser, validateRequest } from '../middlewares'
import * as AgentController from './agent.controllers'
import { AgentSchema } from './agent.schemas'

const router = Router()
/* 
router.get('/', requireUser, AgentController.findAll)

router.post(
  '/',
  [requireUser, validateRequest({ body: AgentSchema })],
  AgentController.createOne
)
router.post('/filter', requireUser, AgentController.filter)
router.put(
  '/deleted/:id',
  [
    requireUser,
    validateRequest({ params: paramsWithIdSchema}),
  ],
  AgentController.deleteOne
)

router.get('/agent-detail',  requireUser,  AgentController.findAgentDetailAll)

router.get(
  '/:id',
  [requireUser, validateRequest({ params: paramsWithIdSchema })],
  AgentController.findOne
)

router.put(
  '/:id',
  [
    requireUser,
    validateRequest({ params: paramsWithIdSchema, body: AgentSchema }),
  ],
  AgentController.updateOne
) */

export default router