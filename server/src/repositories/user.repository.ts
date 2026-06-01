import db from '../config/database'

export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  avatar?: string
  created_at: string
}

export class UserRepository {
  findByEmail(email: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row: any) => {
        if (err) reject(err)
        else resolve(row as User | undefined)
      })
    })
  }

  findById(id: number): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?', [id], (err, row: any) => {
        if (err) reject(err)
        else resolve(row as User | undefined)
      })
    })
  }

  create(username: string, email: string, passwordHash: string): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash],
        function (err) {
          if (err) reject(err)
          else resolve(this.lastID as number)
        }
      )
    })
  }

  getStats(userId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as plant_count FROM plants WHERE user_id = ?', [userId], (err, plantRow: any) => {
        if (err) { reject(err); return }
        db.get('SELECT COUNT(*) as total_records FROM care_records WHERE user_id = ?', [userId], (err, totalRow: any) => {
          if (err) { reject(err); return }
          db.get('SELECT COUNT(*) as water_count FROM care_records WHERE user_id = ? AND type = ?', [userId, 'water'], (err, waterRow: any) => {
            if (err) { reject(err); return }
            db.get('SELECT COUNT(*) as fertilize_count FROM care_records WHERE user_id = ? AND type = ?', [userId, 'fertilize'], (err, fertilizeRow: any) => {
              if (err) { reject(err); return }
              resolve({
                plantCount: plantRow.plant_count,
                totalRecords: totalRow.total_records,
                waterCount: waterRow.water_count,
                fertilizeCount: fertilizeRow.fertilize_count
              })
            })
          })
        })
      })
    })
  }
}

export default new UserRepository()
