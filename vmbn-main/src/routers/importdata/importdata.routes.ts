import { Router } from 'express'
import multer from 'multer'
import { requireUser } from '../middlewares'
import * as ImportController from './importdata.controllers'

const router = Router()

// In-memory upload (xlsx/csv parsed from buffer — works on Vercel serverless).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

router.post('/auto', requireUser, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message })
    next()
  })
}, ImportController.importAuto)

export default router
