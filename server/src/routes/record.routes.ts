import { Router } from 'express'
import recordController from '../controllers/record.controller'
import { authMiddleware } from '../middleware/auth'
import { upload } from '../config/upload'
import { normalizeImage } from '../middleware/normalizeImage'

const router = Router()

router.use(authMiddleware)
router.get('/all', recordController.getAllRecords.bind(recordController))
router.get('/', recordController.getAll.bind(recordController))
router.get('/date/:date', recordController.getByDate.bind(recordController))
router.get('/:id', recordController.getById.bind(recordController))
router.post('/', upload.array('images', 9), normalizeImage, recordController.create.bind(recordController))
router.put('/:id', upload.array('images', 9), normalizeImage, recordController.update.bind(recordController))
router.delete('/:id', recordController.delete.bind(recordController))

export default router
