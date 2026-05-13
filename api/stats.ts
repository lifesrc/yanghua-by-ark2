import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { type } = req.query

  if (type === 'summary') {
    return res.json({
      success: true,
      data: {
        totalRecords: 15,
        waterCount: 10,
        fertilizeCount: 5,
        plantCount: 2,
        weeklyAvg: 3
      }
    })
  }

  if (type === 'trend') {
    const today = new Date()
    const data = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      return {
        date: d.toISOString().split('T')[0],
        water: Math.floor(Math.random() * 3),
        fertilize: Math.floor(Math.random() * 2)
      }
    })
    return res.json({ success: true, data })
  }

  if (type === 'calendar') {
    const { year, month } = req.query
    const data: any[] = []
    const daysInMonth = new Date(parseInt(year as string), parseInt(month as string), 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      if (Math.random() > 0.7) {
        data.push({
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          hasWater: Math.random() > 0.5,
          hasFertilize: Math.random() > 0.7
        })
      }
    }
    return res.json({ success: true, data })
  }

  return res.status(404).json({ success: false, error: 'Not Found' })
}
