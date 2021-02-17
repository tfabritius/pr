import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User, Session } from '@prisma/client'

import { PrismaService } from '../../prisma.service'
import { UsersService } from '../users/users.service'
import { generateUuid } from '../../utils/uuid'

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name)

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  /**
   * Configured session timeout (in seconds)
   */
  get sessionTimeout(): number {
    return this.configService.get<number>('SESSION_TIMEOUT', 15 * 60)
  }

  /**
   * Last date/time for activity to consider session valid
   */
  get lastActivityLimit(): Date {
    const now = new Date()
    return new Date(now.getTime() - this.sessionTimeout * 1000)
  }

  /**
   * Checks token if it belongs to valid session and returns user
   */
  async validateToken(token: string): Promise<User | undefined> {
    try {
      const session = await this.prisma.session.findFirst({
        where: { token, lastActivityAt: { gt: this.lastActivityLimit } },
        include: { user: true },
      })
      delete session.user.password

      if (!!session && !!session.user) {
        // Update lastActivityAt in background
        session.lastActivityAt = new Date()
        this.prisma.session
          .update({
            data: { lastActivityAt: new Date() },
            where: { token },
          })
          .catch((e) => {
            this.logger.error(
              `Error while updating session.lastActivityAt in background: ${e}`,
            )
          })

        // Update last seen date in background
        this.usersService.updateLastSeen(session.user).catch((e) => {
          this.logger.error(
            `Error while updating user.lastSeen in background: ${e}`,
          )
        })

        return session.user
      }
    } catch {
      return
    }
  }

  /**
   * Creates session for user
   */
  async create(user: User) {
    return await this.prisma.session.create({
      data: { token: generateUuid(), userId: user.id },
    })
  }

  /**
   * Gets all sessions of user
   */
  async getAllOfUser(user: User): Promise<Session[]> {
    return await this.prisma.session.findMany({
      where: {
        lastActivityAt: { gt: this.lastActivityLimit },
        userId: user.id,
      },
    })
  }

  /**
   * Deletes session
   * or throws NotFoundException
   */
  async delete(token: string): Promise<void> {
    const session = await this.prisma.session.delete({ where: { token } })
    if (!session) {
      throw new NotFoundException('Session not found')
    }
  }

  /**
   * Deletes expired sessions
   */
  async cleanupExpired(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { lastActivityAt: { lt: this.lastActivityLimit } },
    })
  }
}
