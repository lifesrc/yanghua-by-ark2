import { Request, Response } from 'express'
import Joi from 'joi'
import authService from '../services/auth.service'
import { AuthRequest } from '../middleware/auth'
import userRepository from '../repositories/user.repository'

const registerSchema = Joi.object({
  username: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { error, value } = registerSchema.validate(req.body)
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        })
      }

      const result = await authService.register(value.username, value.email, value.password)

      res.json({
        success: true,
        data: result,
        message: '注册成功'
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { error, value } = loginSchema.validate(req.body)
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        })
      }

      const result = await authService.login(value.email, value.password)

      res.json({
        success: true,
        data: result,
        message: '登录成功'
      })
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      })
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '未登录'
        })
      }

      const user = await userRepository.findById(req.user.id)
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        })
      }

      const { password_hash, ...userWithoutPassword } = user

      res.json({
        success: true,
        data: userWithoutPassword
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
}

export default new AuthController()
