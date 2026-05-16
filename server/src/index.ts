import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001
const JWT_SECRET = 'your-secret-key-here'

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 简单的内存数据存储
const users: any[] = [
  {
    id: 1,
    username: '演示用户',
    email: 'demo@example.com',
    password_hash: bcrypt.hashSync('demo123456', 10),
    avatar: null,
    created_at: new Date().toISOString()
  }
]

const plants: any[] = [
  {
    id: 1,
    user_id: 1,
    name: '多肉小可爱',
    type: 'succulent',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20succulent%20plant%20in%20pot%20morandi%20color%20style&image_size=square_hd',
    notes: '喜欢阳光，少浇水',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 1,
    name: '绿萝吊兰',
    type: 'foliage',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pothos%20plant%20hanging%20in%20pot%20morandi%20color%20style&image_size=square_hd',
    notes: '喜阴，每周浇水一次',
    created_at: new Date().toISOString()
  }
]

const careRecords: any[] = [
  {
    id: 1,
    user_id: 1,
    plant_id: 1,
    type: 'water',
    description: '土壤看起来有点干',
    image: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    user_id: 1,
    plant_id: 2,
    type: 'fertilize',
    description: '施用了稀释的液体肥',
    image: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    user_id: 1,
    plant_id: 1,
    type: 'water',
    description: '',
    image: null,
    created_at: new Date().toISOString()
  }
]

// 认证中间件
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ success: false, error: '未登录' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ success: false, error: '无效的token' })
  }
}

// 认证路由
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = users.find(u => u.email === email)
  
  if (!user) {
    return res.status(400).json({ success: false, error: '用户不存在' })
  }

  const isValidPassword = bcrypt.compareSync(password, user.password_hash)
  if (!isValidPassword) {
    return res.status(400).json({ success: false, error: '密码错误' })
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
  const { password_hash, ...userWithoutPassword } = user

  res.json({
    success: true,
    data: {
      token,
      user: userWithoutPassword
    },
    message: '登录成功'
  })
})

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body
  
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: '所有字段都必须填写' })
  }

  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    return res.status(400).json({ success: false, error: '该邮箱已被注册' })
  }

  const newUser = {
    id: users.length + 1,
    username,
    email,
    password_hash: bcrypt.hashSync(password, 10),
    avatar: null,
    created_at: new Date().toISOString()
  }
  
  users.push(newUser)
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' })
  const { password_hash: _, ...userWithoutPassword } = newUser

  res.json({
    success: true,
    data: {
      token,
      user: userWithoutPassword
    },
    message: '注册成功'
  })
})

app.get('/api/auth/me', authMiddleware, (req: any, res) => {
  const user = users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ success: false, error: '用户不存在' })
  }
  const { password_hash, ...userWithoutPassword } = user
  res.json({ success: true, data: userWithoutPassword })
})

// 植物路由
app.get('/api/plants', authMiddleware, (req: any, res) => {
  const userPlants = plants.filter(p => p.user_id === req.user.id)
  res.json({ success: true, data: userPlants })
})

app.post('/api/plants', authMiddleware, (req: any, res) => {
  const newPlant = {
    id: plants.length + 1,
    user_id: req.user.id,
    ...req.body,
    created_at: new Date().toISOString()
  }
  plants.push(newPlant)
  res.json({ success: true, data: newPlant })
})

app.get('/api/plants/:id', authMiddleware, (req: any, res) => {
  const plant = plants.find(p => p.id === parseInt(req.params.id) && p.user_id === req.user.id)
  if (!plant) {
    return res.status(404).json({ success: false, error: '植物不存在' })
  }
  res.json({ success: true, data: plant })
})

app.put('/api/plants/:id', authMiddleware, (req: any, res) => {
  const plantIndex = plants.findIndex(p => p.id === parseInt(req.params.id) && p.user_id === req.user.id)
  if (plantIndex === -1) {
    return res.status(404).json({ success: false, error: '植物不存在' })
  }
  plants[plantIndex] = { ...plants[plantIndex], ...req.body }
  res.json({ success: true, data: plants[plantIndex] })
})

app.delete('/api/plants/:id', authMiddleware, (req: any, res) => {
  const plantIndex = plants.findIndex(p => p.id === parseInt(req.params.id) && p.user_id === req.user.id)
  if (plantIndex === -1) {
    return res.status(404).json({ success: false, error: '植物不存在' })
  }
  plants.splice(plantIndex, 1)
  res.json({ success: true, message: '删除成功' })
})

// 养护记录路由
app.get('/api/records', authMiddleware, (req: any, res) => {
  let userRecords = careRecords.filter(r => r.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // 添加植物名称和图片
  userRecords = userRecords.map(record => {
    const plant = plants.find(p => p.id === record.plant_id)
    return {
      ...record,
      plant_name: plant?.name,
      plant_image: plant?.image
    }
  })

  res.json({ success: true, data: userRecords })
})

app.post('/api/records', authMiddleware, (req: any, res) => {
  const newRecord = {
    id: careRecords.length + 1,
    user_id: req.user.id,
    ...req.body,
    created_at: new Date().toISOString()
  }
  careRecords.push(newRecord)
  res.json({ success: true, data: newRecord })
})

app.get('/api/records/:id', authMiddleware, (req: any, res) => {
  const record = careRecords.find(r => r.id === parseInt(req.params.id) && r.user_id === req.user.id)
  if (!record) {
    return res.status(404).json({ success: false, error: '记录不存在' })
  }
  res.json({ success: true, data: record })
})

app.put('/api/records/:id', authMiddleware, (req: any, res) => {
  const recordIndex = careRecords.findIndex(r => r.id === parseInt(req.params.id) && r.user_id === req.user.id)
  if (recordIndex === -1) {
    return res.status(404).json({ success: false, error: '记录不存在' })
  }
  careRecords[recordIndex] = { ...careRecords[recordIndex], ...req.body }
  res.json({ success: true, data: careRecords[recordIndex] })
})

app.delete('/api/records/:id', authMiddleware, (req: any, res) => {
  const recordIndex = careRecords.findIndex(r => r.id === parseInt(req.params.id) && r.user_id === req.user.id)
  if (recordIndex === -1) {
    return res.status(404).json({ success: false, error: '记录不存在' })
  }
  careRecords.splice(recordIndex, 1)
  res.json({ success: true, message: '删除成功' })
})

// 统计数据路由
app.get('/api/stats', authMiddleware, (req: any, res) => {
  const userRecords = careRecords.filter(r => r.user_id === req.user.id)
  const userPlants = plants.filter(p => p.user_id === req.user.id)
  
  const totalRecords = userRecords.length
  const waterCount = userRecords.filter(r => r.type === 'water').length
  const fertilizeCount = userRecords.filter(r => r.type === 'fertilize').length
  const plantCount = userPlants.length

  res.json({
    success: true,
    data: {
      totalRecords,
      waterCount,
      fertilizeCount,
      plantCount
    }
  })
})

app.get('/api/stats/trend', authMiddleware, (req: any, res) => {
  const userRecords = careRecords.filter(r => r.user_id === req.user.id)
  const days = parseInt(req.query.days as string) || 30
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  const filteredRecords = userRecords.filter(r => new Date(r.created_at) >= cutoff)
  
  // 按日期分组统计
  const statsByDate: any = {}
  filteredRecords.forEach(record => {
    const date = new Date(record.created_at).toISOString().split('T')[0]
    if (!statsByDate[date]) {
      statsByDate[date] = { date, water: 0, fertilize: 0 }
    }
    if (record.type === 'water') {
      statsByDate[date].water++
    } else if (record.type === 'fertilize') {
      statsByDate[date].fertilize++
    }
  })

  const trend = Object.values(statsByDate).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  res.json({ success: true, data: trend })
})

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '服务器运行正常' })
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`)
  console.log(`演示账号: demo@example.com / demo123456`)
})
