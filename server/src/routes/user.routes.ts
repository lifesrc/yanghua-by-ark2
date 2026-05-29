import { Router } from 'express'
import userController from '../controllers/user.controller'
import plantController from '../controllers/plant.controller'
import recordController from '../controllers/record.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/:id', userController.getUserById.bind(userController))
router.get('/:id/stats', userController.getUserStats.bind(userController))
router.get('/:userId/plants', authMiddleware, plantController.getPlantsByUserId.bind(plantController))
router.get('/:userId/records', authMiddleware, recordController.getRecordsByUserId.bind(recordController))

export default router