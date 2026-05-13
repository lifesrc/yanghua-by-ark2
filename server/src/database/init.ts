import db from '../config/database'
import bcrypt from 'bcryptjs'

export const initDatabase = () => {
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

    CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);
    CREATE INDEX IF NOT EXISTS idx_records_user_id ON care_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_records_plant_id ON care_records(plant_id);
    CREATE INDEX IF NOT EXISTS idx_records_created_at ON care_records(created_at);
  `

  db.exec(initTables, (err) => {
    if (err) {
      console.error('创建表失败:', err)
      return
    }

    db.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
      if (err || row.count > 0) return

      const passwordHash = bcrypt.hashSync('demo123456', 10)

      db.run(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        ['演示用户', 'demo@example.com', passwordHash],
        function (err) {
          if (err) return
          const userId = this.lastID

          const insertPlant = db.prepare('INSERT INTO plants (user_id, name, type, notes, image) VALUES (?, ?, ?, ?, ?)')

          insertPlant.run(
            userId,
            '多肉小可爱',
            'succulent',
            '喜欢阳光，少浇水',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20succulent%20plant%20in%20pot%20morandi%20color%20style&image_size=square_hd'
          )

          insertPlant.run(
            userId,
            '绿萝吊兰',
            'foliage',
            '喜阴，每周浇水一次',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pothos%20plant%20hanging%20in%20pot%20morandi%20color%20style&image_size=square_hd'
          )

          const insertRecord = db.prepare('INSERT INTO care_records (user_id, plant_id, type, description, created_at) VALUES (?, ?, ?, ?, ?)')
          const now = new Date().toISOString()
          const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()

          db.get('SELECT id FROM plants WHERE user_id = ? LIMIT 1', [userId], (err, plant1: any) => {
            if (err || !plant1) return
            db.get('SELECT id FROM plants WHERE user_id = ? AND id != ?', [userId, plant1.id], (err, plant2: any) => {
              if (err || !plant2) return
              insertRecord.run(userId, plant1.id, 'water', '土壤看起来有点干', twoDaysAgo)
              insertRecord.run(userId, plant2.id, 'fertilize', '施用了稀释的液体肥', oneDayAgo)
              insertRecord.run(userId, plant1.id, 'water', '', now)
            })
          })
        }
      )
    })
  })

  console.log('数据库初始化完成')
}
