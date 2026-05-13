import { Router } from 'express'
import recordController from '../controllers/record.controller'
import { authMiddleware } from '../middleware/auth'
import { upload } from '../config/upload'

const router = Router()

router.use(authMiddleware)
router.get('/', recordController.getAll.bind(recordController))
router.get('/date/:date', recordController.getByDate.bind(recordController))
router.get('/:id', recordController.getById.bind(recordController))
router.post('/', upload.single('image'), recordController.create.bind(recordController))
router.delete('/:id', recordController.delete.bind(recordController))

export default router
