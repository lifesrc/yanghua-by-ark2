import { Response } from 'express'
import Joi from 'joi'
import { AuthRequest } from '../middleware/auth'
import plantRepository from '../repositories/plant.repository'

const plantSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('succulent', 'fern', 'flower', 'foliage', 'herb', 'orchid', 'other').required(),
  notes: Joi.string().allow('').optional()
})

export class PlantController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const plants = await plantRepository.findByUserId(req.user.id)

      res.json({
        success: true,
        data: plants
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

      const plant = await plantRepository.findById(parseInt(req.params.id))
      if (!plant) {
        return res.status(404).json({
          success: false,
          error: '植物不存在'
        })
      }

      if (plant.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: '无权限访问'
        })
      }

      res.json({
        success: true,
        data: plant
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

      const { error, value } = plantSchema.validate(req.body)
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        })
      }

      const image = req.file ? `/uploads/${req.file.filename}` : undefined
      const plantId = await plantRepository.create(
        req.user.id,
        value.name,
        value.type,
        image,
        value.notes
      )

      const plant = await plantRepository.findById(plantId)

      res.json({
        success: true,
        data: plant,
        message: '添加成功'
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: '未登录' })
      }

      const plantId = parseInt(req.params.id)
      const existingPlant = await plantRepository.findById(plantId)

      if (!existingPlant) {
        return res.status(404).json({
          success: false,
          error: '植物不存在'
        })
      }

      if (existingPlant.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: '无权限修改'
        })
      }

      const { error, value } = plantSchema.validate(req.body)
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        })
      }

      const image = req.file ? `/uploads/${req.file.filename}` : undefined
      await plantRepository.update(plantId, value.name, value.type, image, value.notes)

      const updatedPlant = await plantRepository.findById(plantId)

      res.json({
        success: true,
        data: updatedPlant,
        message: '修改成功'
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

      const plantId = parseInt(req.params.id)
      const existingPlant = await plantRepository.findById(plantId)

      if (!existingPlant) {
        return res.status(404).json({
          success: false,
          error: '植物不存在'
        })
      }

      if (existingPlant.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: '无权限删除'
        })
      }

      await plantRepository.delete(plantId)

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

export default new PlantController()
