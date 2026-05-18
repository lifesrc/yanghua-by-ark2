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
      db.all('SELECT * FROM plants WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows: any) => {
        if (err) reject(err)
        else resolve(rows as Plant[])
      })
    })
  }

  findById(id: number): Promise<Plant | undefined> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM plants WHERE id = ?', [id], (err, row: any) => {
        if (err) reject(err)
        else resolve(row as Plant | undefined)
      })
    })
  }

  create(userId: number, name: string, type?: string, image?: string, notes?: string): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO plants (user_id, name, type, image, notes) VALUES (?, ?, ?, ?, ?)',
        [userId, name, type || null, image || null, notes || null],
        function (err) {
          if (err) reject(err)
          else resolve(this.lastID as number)
        }
      )
    })
  }

  update(id: number, name: string, type?: string, image?: string | null, notes?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let sql, params
      if (image !== undefined) {
        sql = 'UPDATE plants SET name = ?, type = ?, image = ?, notes = ? WHERE id = ?'
        params = [name, type || null, image || null, notes || null, id]
      } else {
        sql = 'UPDATE plants SET name = ?, type = ?, notes = ? WHERE id = ?'
        params = [name, type || null, notes || null, id]
      }
      db.run(sql, params, function (err) {
        if (err) reject(err)
        else resolve((this.changes || 0) > 0)
      })
    })
  }

  delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM plants WHERE id = ?', [id], function (err) {
        if (err) reject(err)
        else resolve((this.changes || 0) > 0)
      })
    })
  }
}

export default new PlantRepository()
