import db from '../config/database'

export interface Plant {
  id: number
  user_id: number
  name: string
  type: string
  image?: string
  notes?: string
  created_at: string
}

export class PlantRepository {
  findByUserId(userId: number): Promise<Plant[]> {
    return new Promise((resolve, reject) => {
      try {
        const rows = db.prepare('SELECT * FROM plants WHERE user_id = ? ORDER BY created_at DESC').all(userId) as Plant[]
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    })
  }

  findById(id: number): Promise<Plant | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const row = db.prepare('SELECT * FROM plants WHERE id = ?').get(id) as Plant | undefined
        resolve(row)
      } catch (err) {
        reject(err)
      }
    })
  }

  create(userId: number, name: string, type: string, image?: string, notes?: string): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.prepare(
          'INSERT INTO plants (user_id, name, type, image, notes) VALUES (?, ?, ?, ?, ?)'
        ).run(userId, name, type, image || null, notes || null)
        resolve(result.lastInsertRowid as number)
      } catch (err) {
        reject(err)
      }
    })
  }

  update(id: number, name: string, type: string, image?: string, notes?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        let result
        if (image) {
          result = db.prepare('UPDATE plants SET name = ?, type = ?, image = ?, notes = ? WHERE id = ?').run(
            name, type, image, notes || null, id
          )
        } else {
          result = db.prepare('UPDATE plants SET name = ?, type = ?, notes = ? WHERE id = ?').run(
            name, type, notes || null, id
          )
        }
        resolve((result.changes || 0) > 0)
      } catch (err) {
        reject(err)
      }
    })
  }

  delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.prepare('DELETE FROM plants WHERE id = ?').run(id)
        resolve((result.changes || 0) > 0)
      } catch (err) {
        reject(err)
      }
    })
  }
}

export default new PlantRepository()
