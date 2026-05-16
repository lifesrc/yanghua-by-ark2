import db from '../config/database'

export interface RecordImage {
  id: number
  image_path: string
}

export interface CareRecord {
  id: number
  user_id: number
  plant_id: number
  plant_name?: string
  plant_image?: string
  type: 'water' | 'fertilize'
  description?: string
  image?: string
  images?: RecordImage[]
  created_at: string
}

function groupRecordsWithImages(rows: any[]): CareRecord[] {
  const recordMap = new Map<number, CareRecord>()

  rows.forEach(row => {
    if (!recordMap.has(row.id)) {
      recordMap.set(row.id, {
        id: row.id,
        user_id: row.user_id,
        plant_id: row.plant_id,
        plant_name: row.plant_name,
        plant_image: row.plant_image,
        type: row.type,
        description: row.description,
        created_at: row.created_at,
        images: []
      })
    }
    if (row.image_id) {
      recordMap.get(row.id)!.images!.push({
        id: row.image_id,
        image_path: row.image_path
      })
    }
  })

  return Array.from(recordMap.values())
}

export class CareRecordRepository {
  findByUserIdWithImages(userId: number, limit = 50): Promise<CareRecord[]> {
    return new Promise((resolve, reject) => {
      try {
        const rows = db.prepare(`
          SELECT cr.*, p.name as plant_name, p.image as plant_image,
                 ri.id as image_id, ri.image_path
          FROM care_records cr
          LEFT JOIN plants p ON cr.plant_id = p.id
          LEFT JOIN record_images ri ON cr.id = ri.record_id
          WHERE cr.user_id = ?
          ORDER BY cr.created_at DESC
          LIMIT ?
        `).all(userId, limit)
        resolve(groupRecordsWithImages(rows))
      } catch (err) {
        reject(err)
      }
    })
  }

  findByUserId(userId: number, limit = 50): Promise<CareRecord[]> {
    return this.findByUserIdWithImages(userId, limit)
  }

  findByDateWithImages(userId: number, date: string): Promise<CareRecord[]> {
    return new Promise((resolve, reject) => {
      try {
        const rows = db.prepare(`
          SELECT cr.*, p.name as plant_name, p.image as plant_image,
                 ri.id as image_id, ri.image_path
          FROM care_records cr
          LEFT JOIN plants p ON cr.plant_id = p.id
          LEFT JOIN record_images ri ON cr.id = ri.record_id
          WHERE cr.user_id = ? AND DATE(cr.created_at) = ?
          ORDER BY cr.created_at DESC
        `).all(userId, date)
        resolve(groupRecordsWithImages(rows))
      } catch (err) {
        reject(err)
      }
    })
  }

  findByDate(userId: number, date: string): Promise<CareRecord[]> {
    return this.findByDateWithImages(userId, date)
  }

  findByIdWithImages(id: number): Promise<CareRecord | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const rows = db.prepare(`
          SELECT cr.*, p.name as plant_name, p.image as plant_image,
                 ri.id as image_id, ri.image_path
          FROM care_records cr
          LEFT JOIN plants p ON cr.plant_id = p.id
          LEFT JOIN record_images ri ON cr.id = ri.record_id
          WHERE cr.id = ?
        `).all(id)
        resolve(groupRecordsWithImages(rows)[0])
      } catch (err) {
        reject(err)
      }
    })
  }

  findById(id: number): Promise<CareRecord | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const row = db.prepare(`
          SELECT cr.*, p.name as plant_name, p.image as plant_image
          FROM care_records cr
          LEFT JOIN plants p ON cr.plant_id = p.id
          WHERE cr.id = ?
        `).get(id) as CareRecord | undefined
        resolve(row)
      } catch (err) {
        reject(err)
      }
    })
  }

  create(
    userId: number,
    plantId: number,
    type: 'water' | 'fertilize',
    description?: string
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.prepare(`
          INSERT INTO care_records (user_id, plant_id, type, description)
          VALUES (?, ?, ?, ?)
        `).run(userId, plantId, type, description || null)
        resolve(result.lastInsertRowid as number)
      } catch (err) {
        reject(err)
      }
    })
  }

  update(id: number, type?: string, description?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const updates: string[] = []
        const values: any[] = []

        if (type !== undefined) {
          updates.push('type = ?')
          values.push(type)
        }
        if (description !== undefined) {
          updates.push('description = ?')
          values.push(description)
        }

        if (updates.length === 0) {
          resolve(true)
          return
        }

        values.push(id)

        const result = db.prepare(`
          UPDATE care_records
          SET ${updates.join(', ')}
          WHERE id = ?
        `).run(...values)
        resolve((result.changes || 0) > 0)
      } catch (err) {
        reject(err)
      }
    })
  }

  addImage(recordId: number, imagePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.prepare(`
          INSERT INTO record_images (record_id, image_path)
          VALUES (?, ?)
        `).run(recordId, imagePath)
        resolve(result.lastInsertRowid as number)
      } catch (err) {
        reject(err)
      }
    })
  }

  removeImage(imageId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.prepare('DELETE FROM record_images WHERE id = ?').run(imageId)
        resolve((result.changes || 0) > 0)
      } catch (err) {
        reject(err)
      }
    })
  }

  delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.prepare('DELETE FROM care_records WHERE id = ?').run(id)
        resolve((result.changes || 0) > 0)
      } catch (err) {
        reject(err)
      }
    })
  }

  getStats(userId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const totalRow = db.prepare('SELECT COUNT(*) as totalRecords FROM care_records WHERE user_id = ?').get(userId) as any
        const waterRow = db.prepare('SELECT COUNT(*) as waterCount FROM care_records WHERE user_id = ? AND type = ?').get(userId, 'water') as any
        const fertilizeRow = db.prepare('SELECT COUNT(*) as fertilizeCount FROM care_records WHERE user_id = ? AND type = ?').get(userId, 'fertilize') as any
        const plantRow = db.prepare('SELECT COUNT(*) as plantCount FROM plants WHERE user_id = ?').get(userId) as any
        resolve({
          totalRecords: totalRow.totalRecords,
          waterCount: waterRow.waterCount,
          fertilizeCount: fertilizeRow.fertilizeCount,
          plantCount: plantRow.plantCount
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  getTrend(userId: number, days = 30): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const rows = db.prepare(`
          SELECT
            DATE(created_at) as date,
            SUM(CASE WHEN type = 'water' THEN 1 ELSE 0 END) as water,
            SUM(CASE WHEN type = 'fertilize' THEN 1 ELSE 0 END) as fertilize
          FROM care_records
          WHERE user_id = ? AND created_at >= datetime('now', ?)
          GROUP BY DATE(created_at)
          ORDER BY date
        `).all(userId, `-${days} days`)
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    })
  }

  getCalendarData(userId: number, year: number, month: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const rows = db.prepare(`
          SELECT
            DATE(created_at) as date,
            MAX(CASE WHEN type = 'water' THEN 1 ELSE 0 END) as hasWater,
            MAX(CASE WHEN type = 'fertilize' THEN 1 ELSE 0 END) as hasFertilize
          FROM care_records
          WHERE user_id = ? AND strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?
          GROUP BY DATE(created_at)
        `).all(userId, year.toString(), month.toString().padStart(2, '0'))
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    })
  }
}

export default new CareRecordRepository()
