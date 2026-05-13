import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/jwt'

export interface AuthRequest extends Request {
  user?: {
    id: number
    username: string
    email: string
  }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: '未提供认证令牌'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    }
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: '无效的认证令牌'
    })
  }
}
