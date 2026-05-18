import { Router } from 'express'

const router = Router()

// Base API route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '养花 API 服务',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/plants',
      '/api/records',
      '/api/stats'
    ]
  })
})

export default router