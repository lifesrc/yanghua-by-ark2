const HEIC_SIGNATURES = ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'heim', 'heis', 'hevm', 'hevs']

async function isHeicFile(file: File): Promise<boolean> {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  const buf = await file.slice(0, 32).arrayBuffer()
  const bytes = new Uint8Array(buf)
  const ftyp = String.fromCharCode(...bytes.slice(4, 8))
  if (ftyp !== 'ftyp') return false
  const brand = String.fromCharCode(...bytes.slice(8, 12)).toLowerCase()
  return HEIC_SIGNATURES.includes(brand)
}

export async function normalizeImageFile(file: File): Promise<File> {
  if (!(await isHeicFile(file))) return file

  const heic2any = (await import('heic2any')).default
  const blob = (await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })) as Blob
  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() })
}
