import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

const dbDir = path.join(__dirname, '../../database')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const dbPath = path.join(dbDir, 'plant-care.db')
const db = new sqlite3.Database(dbPath)

db.run('PRAGMA foreign_keys = ON')

export default db
