import { Router } from 'express'
import plantController from '../controllers/plant.controller'
import { authMiddleware } from '../middleware/auth'
import { upload } from '../config/upload'
import { normalizeImage } from '../middleware/normalizeImage'

const router = Router()

router.use(authMiddleware)
router.get('/', plantController.getAll.bind(plantController))
router.get('/:id', plantController.getById.bind(plantController))
router.post('/', upload.single('image'), normalizeImage, plantController.create.bind(plantController))
router.put('/:id', upload.single('image'), normalizeImage, plantController.update.bind(plantController))
router.delete('/:id', plantController.delete.bind(plantController))

export default router
