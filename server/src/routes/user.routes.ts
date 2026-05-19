import { Router } from 'express'
import userController from '../controllers/user.controller'

const router = Router()

router.get('/:id', userController.getUserById.bind(userController))
router.get('/:id/stats', userController.getUserStats.bind(userController))

export default router