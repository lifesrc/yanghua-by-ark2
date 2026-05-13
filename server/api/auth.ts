import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path = '' } = req.query
  
  if (req.method === 'POST' && path === 'login') {
    return res.json({ success: true, message: '登录接口' })
  }
  
  if (req.method === 'POST' && path === 'register') {
    return res.json({ success: true, message: '注册接口' })
  }
  
  if (req.method === 'GET' && path === 'me') {
    return res.json({ success: true, data: { id: 1, username: '演示用户' } })
  }

  return res.status(404).json({ success: false, error: 'Not Found' })
}
