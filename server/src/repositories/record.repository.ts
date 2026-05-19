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
  username?: string  // 新增
  user_avatar?: string  // 新增
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
        images: [],
        username: row.username,
        user_avatar: row.user_avatar
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
  findByUserIdWithImages(userId: number, limit = 50, plantId?: number): Promise<CareRecord[]> {
    return new Promise((resolve, reject) => {
      const params: any[] = [userId]
      let whereClause = 'WHERE cr.user_id = ?'
      
      if (plantId !== undefined) {
        whereClause += ' AND cr.plant_id = ?'
        params.push(plantId)
      }
      
      params.push(limit)
      
      console.log('SQL Where clause:', whereClause)
      console.log('SQL params:', params)
      
      db.all(`
        SELECT cr.*, p.name as plant_name, p.image as plant_image,
               ri.id as image_id, ri.image_path
        FROM care_records cr
        LEFT JOIN plants p ON cr.plant_id = p.id
        LEFT JOIN record_images ri ON cr.id = ri.record_id
        ${whereClause}
        ORDER BY cr.created_at DESC
        LIMIT ?
      `, params, (err, rows: any) => {
        if (err) {
          console.error('SQL error:', err)
          reject(err)
        } else {
          console.log('SQL rows:', rows.length)
          resolve(groupRecordsWithImages(rows))
        }
      })
    })
  }

  findByUserId(userId: number, limit = 50): Promise<CareRecord[]> {
    return this.findByUserIdWithImages(userId, limit)
  }

  findByDateWithImages(userId: number, date: string): Promise<CareRecord[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT cr.*, p.name as plant_name, p.image as plant_image,
               ri.id as image_id, ri.image_path
        FROM care_records cr
        LEFT JOIN plants p ON cr.plant_id = p.id
        LEFT JOIN record_images ri ON cr.id = ri.record_id
        WHERE cr.user_id = ? AND DATE(cr.created_at) = ?
        ORDER BY cr.created_at DESC
      `, [userId, date], (err, rows: any) => {
        if (err) reject(err)
        else resolve(groupRecordsWithImages(rows))
      })
    })
  }

  findByDate(userId: number, date: string): Promise<CareRecord[]> {
    return this.findByDateWithImages(userId, date)
  }

  findByIdWithImages(id: number): Promise<CareRecord | undefined> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT cr.*, p.name as plant_name, p.image as plant_image,
               ri.id as image_id, ri.image_path
        FROM care_records cr
        LEFT JOIN plants p ON cr.plant_id = p.id
        LEFT JOIN record_images ri ON cr.id = ri.record_id
        WHERE cr.id = ?
      `, [id], (err, rows: any) => {
        if (err) reject(err)
        else resolve(groupRecordsWithImages(rows)[0])
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
    description?: string
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO care_records (user_id, plant_id, type, description)
        VALUES (?, ?, ?, ?)
      `, [userId, plantId, type, description || null], function (err) {
        if (err) reject(err)
        else resolve(this.lastID as number)
      })
    })
  }

  update(id: number, type?: string, description?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
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

      db.run(`
        UPDATE care_records
        SET ${updates.join(', ')}
        WHERE id = ?
      `, values, function (err) {
        if (err) reject(err)
        else resolve((this.changes || 0) > 0)
      })
    })
  }

  addImage(recordId: number, imagePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO record_images (record_id, image_path)
        VALUES (?, ?)
      `, [recordId, imagePath], function (err) {
        if (err) reject(err)
        else resolve(this.lastID as number)
      })
    })
  }

  removeImage(imageId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM record_images WHERE id = ?', [imageId], function (err) {
        if (err) reject(err)
        else resolve((this.changes || 0) > 0)
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

  deleteByPlantId(plantId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM care_records WHERE plant_id = ?', [plantId], function (err) {
        if (err) reject(err)
        else resolve((this.changes || 0) > 0)
      })
    })
  }

  // 新增获取所有用户养护记录的方法
  findAllWithImages(limit = 15, offset = 0): Promise<CareRecord[]> {
    return new Promise((resolve, reject) => {
      const params: any[] = [limit, offset]

      db.all(`
        SELECT cr.*, p.name as plant_name, p.image as plant_image,
               u.username as username, u.avatar as user_avatar,
               ri.id as image_id, ri.image_path
        FROM care_records cr
        LEFT JOIN plants p ON cr.plant_id = p.id
        LEFT JOIN users u ON cr.user_id = u.id
        LEFT JOIN record_images ri ON cr.id = ri.record_id
        ORDER BY cr.created_at DESC
        LIMIT ? OFFSET ?
      `, params, (err, rows: any) => {
        if (err) {
          console.error('SQL error:', err)
          reject(err)
        } else {
          console.log('SQL rows:', rows.length)
          resolve(groupRecordsWithImages(rows))
        }
      })
    })
  }

  // 新增分页获取用户养护记录的方法
  findByUserIdWithImagesPagination(userId: number, limit = 15, offset = 0): Promise<CareRecord[]> {
    return new Promise((resolve, reject) => {
      const params: any[] = [userId, limit, offset]

      db.all(`
        SELECT cr.*, p.name as plant_name, p.image as plant_image,
               u.username as username, u.avatar as user_avatar,
               ri.id as image_id, ri.image_path
        FROM care_records cr
        LEFT JOIN plants p ON cr.plant_id = p.id
        LEFT JOIN users u ON cr.user_id = u.id
        LEFT JOIN record_images ri ON cr.id = ri.record_id
        WHERE cr.user_id = ?
        ORDER BY cr.created_at DESC
        LIMIT ? OFFSET ?
      `, params, (err, rows: any) => {
        if (err) {
          console.error('SQL error:', err)
          reject(err)
        } else {
          console.log('SQL rows:', rows.length)
          resolve(groupRecordsWithImages(rows))
        }
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
