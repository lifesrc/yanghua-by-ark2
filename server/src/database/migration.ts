import db from '../config/database'

export const runMigrations = () => {
  const migrations = `
    -- 创建记录图片表
    CREATE TABLE IF NOT EXISTS record_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      image_path VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (record_id) REFERENCES care_records(id) ON DELETE CASCADE
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_record_images_record_id ON record_images(record_id);
  `

  db.exec(migrations, (err) => {
    if (err) {
      console.error('执行迁移失败:', err)
      return
    }
    console.log('数据库迁移完成')
  })
}

export const migrateSingleImageToMultiple = () => {
  db.all('SELECT id, image FROM care_records WHERE image IS NOT NULL AND image != \'\'', [], (err, rows: any[]) => {
    if (err) {
      console.error('查询记录失败:', err)
      return
    }

    const insertStmt = db.prepare('INSERT INTO record_images (record_id, image_path) VALUES (?, ?)')

    let migrated = 0
    rows.forEach((row) => {
      insertStmt.run(row.id, row.image, (err: any) => {
        if (!err) migrated++
      })
    })

    insertStmt.finalize(() => {
      console.log(`迁移完成: ${migrated} 条记录图片已移至 record_images 表`)
    })
  })
}
