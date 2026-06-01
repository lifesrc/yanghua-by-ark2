import { Response, Request } from 'express'
import { AuthRequest } from '../middleware/auth'
import recordRepository from '../repositories/record.repository'

export class StatsController {
  async getSummary(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const stats = await recordRepository.getStats(req.user.id)
      const weeklyAvg = stats.totalRecords > 0 ? Math.round((stats.totalRecords / 30) * 7) : 0

      res.json({
        success: true,
        data: {
          ...stats,
          weeklyAvg
        }
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  async getTrend(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 30
      const trend = await recordRepository.getTrend(req.user.id, days)

      res.json({
        success: true,
        data: trend
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  async getCalendarData(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const year = parseInt(req.query.year as string) || new Date().getFullYear()
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1

      const data = await recordRepository.getCalendarData(req.user.id, year, month)

      res.json({
        success: true,
        data
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  async getTrendByUserId(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id)
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: '无效的用户ID' })
      }

      const days = req.query.days ? parseInt(req.query.days as string) : 30
      const trend = await recordRepository.getTrend(userId, days)

      res.json({
        success: true,
        data: trend
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
}

export default new StatsController()
