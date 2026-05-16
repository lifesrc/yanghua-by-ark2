import initSqlJs from 'sql.js'
import path from 'path'
import fs from 'fs'

// 创建数据库目录
const dbDir = path.join(__dirname, '../../database')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const dbPath = path.join(dbDir, 'plant-care.db')

let SQL: any
let db: any

export async function initDatabaseConnection(): Promise<void> {
  // 初始化 sql.js
  SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`
  })

  // 如果数据库文件存在，从文件读取；否则创建新数据库
  let dbBuffer: Buffer | null = null
  if (fs.existsSync(dbPath)) {
    dbBuffer = fs.readFileSync(dbPath)
  }

  // 创建数据库实例
  db = new SQL.Database(dbBuffer)
}

export function getDatabase() {
  return db
}

export function saveDatabase() {
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
}

export { SQL }
