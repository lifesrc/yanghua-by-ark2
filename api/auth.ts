import { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'plant-care-default-secret'

const mockUsers: Record<string, any> = {
  'demo@example.com': {
    id: 1,
    username: '演示用户',
    email: 'demo@example.com',
    password: 'demo123456'
  }
}

const plants = [
  { id: 1, user_id: 1, name: '多肉小可爱', type: 'succulent', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20succulent%20plant%20in%20pot%20morandi%20color%20style&image_size=square_hd' },
  { id: 2, user_id: 1, name: '绿萝吊兰', type: 'foliage', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pothos%20plant%20hanging%20in%20pot%20morandi%20color%20style&image_size=square_hd' }
]

const records = [
  { id: 1, user_id: 1, plant_id: 1, type: 'water', description: '土壤看起来有点干', created_at: '2026-05-10 12:37:12' },
  { id: 2, user_id: 1, plant_id: 2, type: 'fertilize', description: '施用了稀释的液体肥', created_at: '2026-05-09 12:37:12' },
  { id: 3, user_id: 1, plant_id: 1, type: 'water', description: '', created_at: '2026-05-12 08:00:00' }
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { action } = req.query

  if (req.method === 'POST' && action === 'login') {
    const { email, password } = req.body
    const user = mockUsers[email]

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: '邮箱或密码错误' })
    }

    const token = jwt.sign({ id: user.id, username: user.username, email }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...userWithoutPassword } = user

    return res.json({
      success: true,
      data: { user: userWithoutPassword, token },
      message: '登录成功'
    })
  }

  if (req.method === 'POST' && action === 'register') {
    const { username, email, password } = req.body

    if (mockUsers[email]) {
      return res.status(400).json({ success: false, error: '该邮箱已注册' })
    }

    const newUser = {
      id: Object.keys(mockUsers).length + 1,
      username,
      email,
      password
    }
    mockUsers[email] = newUser

    const token = jwt.sign({ id: newUser.id, username, email }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...userWithoutPassword } = newUser

    return res.json({
      success: true,
      data: { user: userWithoutPassword, token },
      message: '注册成功'
    })
  }

  return res.status(404).json({ success: false, error: 'Not Found' })
}
