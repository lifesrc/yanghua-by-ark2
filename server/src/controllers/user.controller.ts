import { Request, Response } from 'express'
import userRepository from '../repositories/user.repository'

export class UserController {
  async getUserById(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id)
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: '无效的用户ID'
        })
      }

      const user = await userRepository.findById(userId)
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

  async getUserStats(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id)
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: '无效的用户ID'
        })
      }

      const stats = await userRepository.getStats(userId)

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