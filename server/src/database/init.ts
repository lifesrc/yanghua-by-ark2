import { getDatabase, saveDatabase } from '../config/database'
import bcrypt from 'bcryptjs'

export function initDatabase(): void {
  const db = getDatabase()
  if (!db) return

  try {
    const initTables = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        image VARCHAR(255),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS care_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plant_id INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL CHECK(type IN ('water', 'fertilize')),
        description TEXT,
        image VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS record_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        record_id INTEGER NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (record_id) REFERENCES care_records(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);
      CREATE INDEX IF NOT EXISTS idx_records_user_id ON care_records(user_id);
      CREATE INDEX IF NOT EXISTS idx_records_plant_id ON care_records(plant_id);
      CREATE INDEX IF NOT EXISTS idx_records_created_at ON care_records(created_at);
    `

    db.run(initTables)

    // 检查是否有用户
    const result = db.exec('SELECT COUNT(*) as count FROM users')
    const count = result[0]?.values[0]?.[0] || 0

    if (count === 0) {
      const passwordHash = bcrypt.hashSync('demo123456', 10)
      
      // 插入演示用户
      const insertUser = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      insertUser.run(['演示用户', 'demo@example.com', passwordHash])
      const userId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0]
      
      // 插入演示植物
      const insertPlant = db.prepare('INSERT INTO plants (user_id, name, type, notes, image) VALUES (?, ?, ?, ?, ?)')
      insertPlant.run([
        userId,
        '多肉小可爱',
        'succulent',
        '喜欢阳光，少浇水',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20succulent%20plant%20in%20pot%20morandi%20color%20style&image_size=square_hd'
      ])
      
      insertPlant.run([
        userId,
        '绿萝吊兰',
        'foliage',
        '喜阴，每周浇水一次',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pothos%20plant%20hanging%20in%20pot%20morandi%20color%20style&image_size=square_hd'
      ])
      
      // 获取植物ID
      const plantsResult = db.exec('SELECT id FROM plants WHERE user_id = ?', [userId])
      if (plantsResult.length > 0 && plantsResult[0].values.length >= 2) {
        const plant1Id = plantsResult[0].values[0][0]
        const plant2Id = plantsResult[0].values[1][0]
        
        const insertRecord = db.prepare('INSERT INTO care_records (user_id, plant_id, type, description, created_at) VALUES (?, ?, ?, ?, ?)')
        const now = new Date().toISOString()
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        
        insertRecord.run([userId, plant1Id, 'water', '土壤看起来有点干', twoDaysAgo])
        insertRecord.run([userId, plant2Id, 'fertilize', '施用了稀释的液体肥', oneDayAgo])
        insertRecord.run([userId, plant1Id, 'water', '', now])
      }
      
      saveDatabase()
    }

    console.log('数据库初始化完成')
  } catch (err) {
    console.error('创建表失败:', err)
  }
}
