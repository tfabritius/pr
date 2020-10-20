import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import * as argon2 from 'argon2'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Creates user
   * or throws BadRequestException (if username exists)
   */
  async create(username: string): Promise<User> {
    username = username.toLowerCase()

    // Check uniqueness of username
    try {
      const existingUser = this.getOneByUsername(username)
      if (existingUser) {
        throw new BadRequestException('Username is alreay in use.')
      }
    } catch {}

    // Create new user
    const newUser = new User()
    newUser.username = username

    return await this.userRepository.save(newUser)
  }

  /**
   * Gets user identified by userId
   * or throws NotFoundException
   */
  async getOne(userId: number): Promise<User> {
    const user = await this.userRepository.findOne(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  /**
   * Gets user identified by username
   * or throws NotFoundException
   */
  async getOneByUsername(username: string): Promise<User> {
    username = username.toLowerCase()

    const user = await this.userRepository.findOne({ username })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  /**
   * Updates password of user
   */
  async updatePassword(user: User, newPassword: string): Promise<User> {
    user.password = await argon2.hash(newPassword)
    return await this.userRepository.save(user)
  }

  /**
   * Verfies password of user
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    const db = await this.userRepository.findOne(user.id, {
      select: ['password'],
    })

    return await argon2.verify(db.password, password)
  }

  /**
   * Update last seen date if necessary
   */
  async updateLastSeen(user: User): Promise<void> {
    const todayDate = new Date().toISOString().slice(0, 10)

    if (user.lastSeenAt != todayDate) {
      user.lastSeenAt = todayDate
      await this.userRepository.save(user)
    }
  }

  /**
   * Deletes users
   * or throws NotFoundException
   */
  async delete(userId: number): Promise<void> {
    const { affected } = await this.userRepository.delete(userId)
    if (affected == 0) {
      throw new NotFoundException('User not found')
    }
  }
}
