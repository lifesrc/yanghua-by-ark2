import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { initDatabase } from './database/init'
import authRoutes from './routes/auth.routes'
import plantRoutes from './routes/plant.routes'
import recordRoutes from './routes/record.routes'
import statsRoutes from './routes/stats.routes'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/plants', plantRoutes)
app.use('/api/records', recordRoutes)
app.use('/api/stats', statsRoutes)

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

initDatabase()

app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`)
})
