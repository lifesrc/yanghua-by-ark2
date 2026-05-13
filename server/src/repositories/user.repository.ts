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
}

export default new UserRepository()
