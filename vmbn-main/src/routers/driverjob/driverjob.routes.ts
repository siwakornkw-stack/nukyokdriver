import { Router } from 'express'
import { requireUser } from '../middlewares'
import * as DriverJobController from './driverjob.controllers'

const router = Router()

// Drivers + their LINE link status (for the dispatch page)
router.get('/drivers', requireUser, DriverJobController.getDrivers)
router.get('/line/senders', requireUser, DriverJobController.getLineSenders)
router.post('/drivers/line/:id', requireUser, DriverJobController.setDriverLine)

// Jobs
router.get('/', requireUser, DriverJobController.getJobs)
router.post('/add', requireUser, DriverJobController.addJob)
router.post('/assign/:id', requireUser, DriverJobController.assignDriver)
router.post('/cancel/:id', requireUser, DriverJobController.cancelJob)

export default router
