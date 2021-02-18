import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { startOfDay, isEqual } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'

import { PrismaService } from '../../prisma.service'

import * as argon2 from 'argon2'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates user
   * or throws BadRequestException (if username exists)
   */
  async create(username: string): Promise<User> {
    username = username.toLowerCase()

    // Check uniqueness of username
    let existingUser: User
    try {
      existingUser = await this.getOneByUsername(username)
    } catch {
      // keep existingUser undefined
    }

    if (existingUser) {
      throw new BadRequestException('Username is already in use.')
    }

    // Create new user
    return await this.prisma.user.create({ data: { username } })
  }

  /**
   * Gets user identified by userId
   * or throws NotFoundException
   */
  async getOne(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })
    delete user.password

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

    const user = await this.prisma.user.findUnique({ where: { username } })
    delete user.password

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  /**
   * Updates password of user
   */
  async updatePassword(
    { id }: { id: number },
    newPassword: string,
  ): Promise<User> {
    const password = await argon2.hash(newPassword)
    return await this.prisma.user.update({
      data: { password },
      where: { id },
    })
  }

  /**
   * Verfies password of user
   */
  async verifyPassword(
    { id }: { id: number },
    password: string,
  ): Promise<boolean> {
    const { password: dbPassword } = await this.prisma.user.findUnique({
      where: { id },
      select: { password: true },
    })
    return await argon2.verify(dbPassword, password)
  }

  /**
   * Update last seen date if necessary
   */
  async updateLastSeen(user: User): Promise<void> {
    const todayDateUtc = zonedTimeToUtc(startOfDay(new Date()), 'local')

    if (!isEqual(user.lastSeenAt, todayDateUtc)) {
      await this.prisma.user.update({
        data: { lastSeenAt: todayDateUtc },
        where: { id: user.id },
      })
    }
  }

  /**
   * Deletes users
   * or throws NotFoundException
   */
  async delete(userId: number): Promise<void> {
    // Cascading deletes don't work: https://github.com/prisma/prisma/issues/2057
    const affected = await this.prisma
      .$executeRaw`DELETE FROM users WHERE id=${userId}`
    if (affected == 0) {
      throw new NotFoundException('User not found')
    }
  }
}
