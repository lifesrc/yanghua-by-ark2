import { VercelRequest, VercelResponse } from '@vercel/node'

let records = [
  { id: 1, user_id: 1, plant_id: 1, type: 'water', description: '土壤看起来有点干', image: '', created_at: '2026-05-10 12:37:12' },
  { id: 2, user_id: 1, plant_id: 2, type: 'fertilize', description: '施用了稀释的液体肥', image: '', created_at: '2026-05-09 12:37:12' },
  { id: 3, user_id: 1, plant_id: 1, type: 'water', description: '', image: '', created_at: '2026-05-12 08:00:00' }
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const { date } = req.query
    if (date) {
      const filtered = records.filter(r => r.created_at.startsWith(date as string))
      return res.json({ success: true, data: filtered })
    }
    return res.json({ success: true, data: records })
  }

  if (req.method === 'POST') {
    const { plantId, type, description, image } = req.body
    const newRecord = {
      id: records.length + 1,
      user_id: 1,
      plant_id: parseInt(plantId),
      type,
      description: description || '',
      image: image || '',
      created_at: new Date().toISOString()
    }
    records.unshift(newRecord)
    return res.json({ success: true, data: newRecord, message: '记录成功' })
  }

  return res.status(404).json({ success: false, error: 'Not Found' })
}
