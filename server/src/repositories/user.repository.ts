import { getDatabase, saveDatabase } from '../config/database'

export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  avatar?: string
  created_at: string
}

function rowsToObjects(columns: string[], values: any[][]): any[] {
  return values.map(row => {
    const obj: any = {}
    columns.forEach((col, index) => {
      obj[col] = row[index]
    })
    return obj
  })
}

export class UserRepository {
  findByEmail(email: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const db = getDatabase()
        const result = db.exec('SELECT * FROM users WHERE email = ?', [email])
        if (result.length === 0) {
          resolve(undefined)
          return
        }
        const users = rowsToObjects(result[0].columns, result[0].values)
        resolve(users[0] as User)
      } catch (err) {
        reject(err)
      }
    })
  }

  findById(id: number): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const db = getDatabase()
        const result = db.exec('SELECT id, username, email, avatar, created_at FROM users WHERE id = ?', [id])
        if (result.length === 0) {
          resolve(undefined)
          return
        }
        const users = rowsToObjects(result[0].columns, result[0].values)
        resolve(users[0] as User)
      } catch (err) {
        reject(err)
      }
    })
  }

  create(username: string, email: string, passwordHash: string): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const db = getDatabase()
        const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
        stmt.run([username, email, passwordHash])
        const result = db.exec('SELECT last_insert_rowid() as id')
        saveDatabase()
        resolve(result[0].values[0][0])
      } catch (err) {
        reject(err)
      }
    })
  }
}

export default new UserRepository()
