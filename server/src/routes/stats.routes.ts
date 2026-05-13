import { Router } from 'express'
import statsController from '../controllers/stats.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)
router.get('/summary', statsController.getSummary.bind(statsController))
router.get('/trend', statsController.getTrend.bind(statsController))
router.get('/calendar', statsController.getCalendarData.bind(statsController))

export default router
