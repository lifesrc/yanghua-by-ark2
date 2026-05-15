import fs from 'fs/promises'
import path from 'path'
import FileType from 'file-type'
import heicConvert from 'heic-convert'

const uploadsDir = path.join(__dirname, '../uploads')
const HEIC_TYPES = new Set(['heic', 'heif'])

async function normalizeHeicToJpeg(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath)
  const detected = await FileType.fromBuffer(buffer)

  if (!detected) {
    console.log(`无法识别格式，跳过：${path.basename(filePath)}`)
    return filePath
  }

  const realExt = detected.ext.toLowerCase()
  const currentExt = path.extname(filePath).toLowerCase().slice(1)

  if (!HEIC_TYPES.has(realExt)) {
    if (realExt !== currentExt) {
      const dir = path.dirname(filePath)
      const baseName = path.basename(filePath, path.extname(filePath))
      const newPath = path.join(dir, baseName + '.' + realExt)
      await fs.rename(filePath, newPath)
      console.log(`修正扩展名：${path.basename(filePath)} -> ${path.basename(newPath)}`)
      return newPath
    }
    console.log(`格式正确，跳过：${path.basename(filePath)}`)
    return filePath
  }

  console.log(`发现HEIC格式：${path.basename(filePath)}`)

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

  console.log(`已转换HEIC：${path.basename(filePath)} -> ${path.basename(newPath)}`)
  return newPath
}

async function main() {
  console.log('开始检查并修复图片格式...')
  console.log(`目录：${uploadsDir}`)

  const files = await fs.readdir(uploadsDir)
  const imageFiles = files.filter(f => /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(f))

  console.log(`找到 ${imageFiles.length} 个图片文件`)

  let converted = 0
  for (const file of imageFiles) {
    const filePath = path.join(uploadsDir, file)
    try {
      await normalizeHeicToJpeg(filePath)
      converted++
    } catch (err) {
      console.error(`处理失败：${file}`, err)
    }
  }

  console.log(`处理完成，共处理 ${converted} 个文件`)
}

main().catch(console.error)
