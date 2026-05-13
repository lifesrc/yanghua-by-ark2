import { VercelRequest, VercelResponse } from '@vercel/node'

const plants = [
  { id: 1, user_id: 1, name: '多肉小可爱', type: 'succulent', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20succulent%20plant%20in%20pot%20morandi%20color%20style&image_size=square_hd', notes: '喜欢阳光，少浇水', created_at: '2026-05-10 12:37:12' },
  { id: 2, user_id: 1, name: '绿萝吊兰', type: 'foliage', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pothos%20plant%20hanging%20in%20pot%20morandi%20color%20style&image_size=square_hd', notes: '喜阴，每周浇水一次', created_at: '2026-05-10 12:37:12' }
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return res.json({ success: true, data: plants })
  }

  if (req.method === 'POST') {
    const { name, type, notes } = req.body
    const newPlant = {
      id: plants.length + 1,
      user_id: 1,
      name,
      type,
      notes,
      image: '',
      created_at: new Date().toISOString()
    }
    plants.push(newPlant)
    return res.json({ success: true, data: newPlant, message: '添加成功' })
  }

  return res.status(404).json({ success: false, error: 'Not Found' })
}
