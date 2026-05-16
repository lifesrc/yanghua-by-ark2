import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import userRepository from '../repositories/user.repository'
import plantRepository from '../repositories/plant.repository'
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt'
import fs from 'fs'
import path from 'path'

const defaultPlants = [
  { name: '绿萝', type: 'foliage', imageName: 'luffa.jpg', notes: '绿萝是一种常见的室内观叶植物，易于养护，具有很好的空气净化效果。喜欢温暖湿润的环境，忌阳光直射。' },
  { name: '多肉植物', type: 'succulent', imageName: 'duorou.jpg', notes: '多肉植物是一类耐旱植物的统称，叶片肥厚多汁，形态各异。适合懒人养护，需要充足阳光和疏松的土壤。' },
  { name: '虎皮兰', type: 'foliage', imageName: 'hubilan.jpg', notes: '虎皮兰叶片直立，带有虎纹状斑纹。非常耐旱耐阴，是极佳的室内净化植物，可以吸收甲醛等有害气体。' },
  { name: '薄荷', type: 'herb', imageName: 'bohe.jpg', notes: '薄荷是一种芳香草本植物，叶片清凉芳香。可以用于烹饪、泡茶，具有提神醒脑的功效。' },
  { name: '蝴蝶兰', type: 'orchid', imageName: 'hudielan.jpg', notes: '蝴蝶兰是高档花卉，花朵形似蝴蝶，花色丰富。花期长，是春节期间受欢迎的年宵花。' },
  { name: '茉莉花', type: 'flower', imageName: 'molihua.jpg', notes: '茉莉花洁白芳香，是著名的香花植物。可以用来制作花茶，象征着纯洁和美好。' },
  { name: '风信子', type: 'flower', imageName: 'fengxindi.jpg', notes: '风信子是球根花卉，花茎上开满密集的小花，颜色丰富。适合水培或土培，春季开花。' },
  { name: '向日葵', type: 'flower', imageName: 'xiangrikui.jpg', notes: '向日葵是阳光的象征，花朵跟随太阳转动。种子可以食用，是重要的油料作物。' }
]

const plantImagesDir = '/Users/liuzhan/Desktop/养花8/public/plants'
const uploadsDir = path.join(__dirname, '../../uploads')

export class AuthService {
  async register(username: string, email: string, password: string) {
    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      throw new Error('该邮箱已被注册')
    }

    const passwordHash = bcrypt.hashSync(password, 10)
    const userId = await userRepository.create(username, email, passwordHash)
    const user = await userRepository.findById(userId)

    if (!user) {
      throw new Error('注册失败')
    }

    await this.createDefaultPlants(userId)

    const token = this.generateToken(user)
    return { user, token }
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new Error('邮箱或密码错误')
    }

    const isValid = bcrypt.compareSync(password, user.password_hash)
    if (!isValid) {
      throw new Error('邮箱或密码错误')
    }

    const token = this.generateToken(user)
    const { password_hash, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  private async createDefaultPlants(userId: number) {
    console.log(`Creating default plants for user ${userId}`)
    console.log(`Plant images dir: ${plantImagesDir}`)
    console.log(`Uploads dir: ${uploadsDir}`)

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log('Created uploads directory')
    }

    for (const plantData of defaultPlants) {
      let imagePath: string | undefined

      try {
        const sourcePath = path.join(plantImagesDir, plantData.imageName)
        console.log(`Processing ${plantData.name}: ${sourcePath}`)
        
        if (fs.existsSync(sourcePath)) {
          const destFileName = 'plant-default-' + plantData.imageName
          const destPath = path.join(uploadsDir, destFileName)
          
          if (!fs.existsSync(destPath)) {
            fs.copyFileSync(sourcePath, destPath)
            console.log(`Copied ${plantData.imageName} to ${destPath}`)
          } else {
            console.log(`File already exists: ${destPath}`)
          }
          
          imagePath = '/uploads/' + destFileName
        } else {
          console.log(`Source file not found: ${sourcePath}`)
        }
      } catch (err) {
        console.error(`Failed to copy image for ${plantData.name}:`, err)
      }

      try {
        const plantId = await plantRepository.create(userId, plantData.name, plantData.type, imagePath, plantData.notes)
        console.log(`Created plant ${plantData.name} with id ${plantId}`)
      } catch (err) {
        console.error(`Failed to create plant ${plantData.name}:`, err)
      }
    }
    console.log('Default plants creation completed')
  }

  private generateToken(user: any) {
    return jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }
}

export default new AuthService()