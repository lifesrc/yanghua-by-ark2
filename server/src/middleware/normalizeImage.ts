import { Request, Response, NextFunction } from 'express'
import fs from 'fs/promises'
import path from 'path'
import FileType from 'file-type'
import heicConvert from 'heic-convert'

const HEIC_TYPES = new Set(['heic', 'heif'])

async function normalizeHeicToJpeg(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath)
  const detected = await FileType.fromBuffer(buffer)

  if (!detected) {
    return filePath
  }

  const realExt = detected.ext.toLowerCase()

  if (!HEIC_TYPES.has(realExt)) {
    return filePath
  }

  const dir = path.dirname(filePath)
  const baseName = path.basename(filePath, path.extname(filePath))
  const newPath = path.join(dir, baseName + '.jpg')

  const output = await heicConvert({
    buffer: buffer as any,
    format: 'JPEG',
    quality: 0.9
  })
  const jpegBuffer = Buffer.from(output)

  await fs.writeFile(newPath, jpegBuffer)

  if (filePath !== newPath) {
    await fs.unlink(filePath).catch(() => {})
  }

  return newPath
}

function rewriteFileMeta(file: Express.Multer.File, newPath: string) {
  file.path = newPath
  file.filename = path.basename(newPath)
  if (newPath.toLowerCase().endsWith('.jpg') || newPath.toLowerCase().endsWith('.jpeg')) {
    file.mimetype = 'image/jpeg'
  }
}

export async function normalizeImage(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.file) {
      const newPath = await normalizeHeicToJpeg(req.file.path)
      rewriteFileMeta(req.file, newPath)
    }

    if (req.files) {
      const files = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat()
      for (const file of files) {
        const newPath = await normalizeHeicToJpeg(file.path)
        rewriteFileMeta(file, newPath)
      }
    }

    next()
  } catch (err: any) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {})
    }
    next(err)
  }
}
