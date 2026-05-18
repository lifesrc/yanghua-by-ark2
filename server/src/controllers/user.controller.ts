import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import userRepository from '../repositories/user.repository'

export class UserController {
  async getUserInfo(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const user = await userRepository.findById(parseInt(req.params.id))
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        })
      }

      res.json({
        success: true,
        data: user
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  async getUserStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const stats = await userRepository.getStats(parseInt(req.params.id))

      res.json({
        success: true,
        data: stats
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
}

export default new UserController()
