import { Router } from 'express'
import { requireUser } from '../middlewares'
import * as reportController from './report.controllers'
import multer from 'multer';

const router = Router()
// Configure multer middleware to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });
const notifyTelegramMsg = multer({ storage: multer.memoryStorage() });
/* 
router.get('/products', requireUser, reportController.products)
router.get('/promotion-condition', requireUser, reportController.promotionCondition)
router.get('/fetch-products', requireUser, reportController.fetchProducts)
router.post('/filter', requireUser, reportController.filter)
router.post('/batch', requireUser, reportController.batch)
router.post('/pay-bill', requireUser, reportController.payBill)
router.post('/calculate-manual', requireUser, reportController.calculateManual)

router.post('/onetime-promo', requireUser, reportController.callOnetimePromo)
router.post('/individual-bill-filter', requireUser, reportController.individualBillFilter)

router.post('/individual-promo', requireUser, reportController.callIndividualPromo)
router.post('/individual-filter', requireUser, reportController.individualFilter)
router.post('/notify-telegram-msg', requireUser,notifyTelegramMsg.any(), reportController.sendTelegramMsg)

router.post('/bill-detail', requireUser, reportController.callBillDetails)
router.post('/notify-telegram', requireUser, reportController.sendTelegram)

router.post('/upload', requireUser, upload.single('image'), reportController.uploadImage)

router.post('/summary-by-agent', requireUser, reportController.summaryByAgent)
router.post('/summary-by-promotion', requireUser, reportController.summaryByPromotion) */
export default router
