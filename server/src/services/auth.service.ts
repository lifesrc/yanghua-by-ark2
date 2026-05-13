import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import userRepository from '../repositories/user.repository'
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt'

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

  private generateToken(user: any) {
    return jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }
}

export default new AuthService()
