import db from '../config/database'

export interface CareRecord {
  id: number
  user_id: number
  plant_id: number
  plant_name?: string
  plant_image?: string
  type: 'water' | 'fertilize'
  description?: string
  image?: string
  created_at: string
}

export class CareRecordRepository {
  findByUserId(userId: number, limit = 50): Promise<CareRecord[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT cr.*, p.name as plant_name, p.image as plant_image
        FROM care_records cr
        LEFT JOIN plants p ON cr.plant_id = p.id
        WHERE cr.user_id = ?
        ORDER BY cr.created_at DESC
        LIMIT ?
      `, [userId, limit], (err, rows: any) => {
        if (err) reject(err)
        else resolve(rows as CareRecord[])
      })
    })
  }

  findByDate(userId: number, date: string): Promise<CareRecord[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT cr.*, p.name as plant_name, p.image as plant_image
        FROM care_records cr
        LEFT JOIN plants p ON cr.plant_id = p.id
        WHERE cr.user_id = ? AND DATE(cr.created_at) = ?
        ORDER BY cr.created_at DESC
      `, [userId, date], (err, rows: any) => {
        if (err) reject(err)
        else resolve(rows as CareRecord[])
      })
    })
  }

  findById(id: number): Promise<CareRecord | undefined> {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT cr.*, p.name as plant_name, p.image as plant_image
        FROM care_records cr
        LEFT JOIN plants p ON cr.plant_id = p.id
        WHERE cr.id = ?
      `, [id], (err, row: any) => {
        if (err) reject(err)
        else resolve(row as CareRecord | undefined)
      })
    })
  }

  create(
    userId: number,
    plantId: number,
    type: 'water' | 'fertilize',
    description?: string,
    image?: string
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO care_records (user_id, plant_id, type, description, image)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, plantId, type, description || null, image || null], function (err) {
        if (err) reject(err)
        else resolve(this.lastID as number)
      })
    })
  }

  delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM care_records WHERE id = ?', [id], function (err) {
        if (err) reject(err)
        else resolve((this.changes || 0) > 0)
      })
    })
  }

  getStats(userId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as totalRecords FROM care_records WHERE user_id = ?', [userId], (err, totalRow: any) => {
        if (err) { reject(err); return }
        db.get('SELECT COUNT(*) as waterCount FROM care_records WHERE user_id = ? AND type = ?', [userId, 'water'], (err, waterRow: any) => {
          if (err) { reject(err); return }
          db.get('SELECT COUNT(*) as fertilizeCount FROM care_records WHERE user_id = ? AND type = ?', [userId, 'fertilize'], (err, fertilizeRow: any) => {
            if (err) { reject(err); return }
            db.get('SELECT COUNT(*) as plantCount FROM plants WHERE user_id = ?', [userId], (err, plantRow: any) => {
              if (err) { reject(err); return }
              resolve({
                totalRecords: totalRow.totalRecords,
                waterCount: waterRow.waterCount,
                fertilizeCount: fertilizeRow.fertilizeCount,
                plantCount: plantRow.plantCount
              })
            })
          })
        })
      })
    })
  }

  getTrend(userId: number, days = 30): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT
          DATE(created_at) as date,
          SUM(CASE WHEN type = 'water' THEN 1 ELSE 0 END) as water,
          SUM(CASE WHEN type = 'fertilize' THEN 1 ELSE 0 END) as fertilize
        FROM care_records
        WHERE user_id = ? AND created_at >= datetime('now', ?)
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [userId, `-${days} days`], (err, rows: any) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  getCalendarData(userId: number, year: number, month: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT
          DATE(created_at) as date,
          MAX(CASE WHEN type = 'water' THEN 1 ELSE 0 END) as hasWater,
          MAX(CASE WHEN type = 'fertilize' THEN 1 ELSE 0 END) as hasFertilize
        FROM care_records
        WHERE user_id = ? AND strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?
        GROUP BY DATE(created_at)
      `, [userId, year.toString(), month.toString().padStart(2, '0')], (err, rows: any) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
}

export default new CareRecordRepository()
