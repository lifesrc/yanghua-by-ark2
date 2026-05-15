import { Response } from 'express'
import Joi from 'joi'
import { AuthRequest } from '../middleware/auth'
import recordRepository from '../repositories/record.repository'
import plantRepository from '../repositories/plant.repository'

const recordSchema = Joi.object({
  plantId: Joi.number().required(),
  type: Joi.string().valid('water', 'fertilize').required(),
  description: Joi.string().allow('').optional()
})

export class RecordController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50
      const records = await recordRepository.findByUserId(req.user.id, limit)

      res.json({
        success: true,
        data: records
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  async getByDate(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const { date } = req.params
      const records = await recordRepository.findByDate(req.user.id, date)

      res.json({
        success: true,
        data: records
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const record = await recordRepository.findById(parseInt(req.params.id))
      if (!record) {
        return res.status(404).json({
          success: false,
          error: '记录不存在'
        })
      }

      if (record.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: '无权限访问'
        })
      }

      res.json({
        success: true,
        data: record
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const { error, value } = recordSchema.validate(req.body)
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        })
      }

      const plant = await plantRepository.findById(value.plantId)
      if (!plant || plant.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: '植物不存在或无权限'
        })
      }
      const image = req.file ? `/uploads/${req.file.filename}` : undefined
      const recordId = await recordRepository.create(
        req.user.id,
        value.plantId,
        value.type,
        value.description,
        image
      )

      const record = await recordRepository.findById(recordId)

      res.json({
        success: true,
        data: record,
        message: value.type === 'water' ? '浇水记录已添加' : '施肥记录已添加'
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const recordId = parseInt(req.params.id)
      const existingRecord = await recordRepository.findById(recordId)

      if (!existingRecord) {
        return res.status(404).json({
          success: false,
          error: '记录不存在'
        })
      }

      if (existingRecord.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: '无权限删除'
        })
      }

      await recordRepository.delete(recordId)

      res.json({
        success: true,
        message: '删除成功'
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
}

export default new RecordController()
