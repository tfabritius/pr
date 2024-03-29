import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User, Session } from '@prisma/client'
import { differenceInSeconds } from 'date-fns'

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
        const now = new Date()
        // Update lastActivityAt in background
        // if is more than 1 minute old (don't update too often)
        if (differenceInSeconds(now, session.lastActivityAt) > 60) {
          this.prisma.session
            .update({
              data: { lastActivityAt: now },
              where: { token },
            })
            .catch((e) => {
              this.logger.error(
                `Error while updating session.lastActivityAt in background: ${e}`,
              )
            })
        }

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
  async create({ id }: { id: number }, { note }: { note?: string } = {}) {
    return await this.prisma.session.create({
      data: { token: generateUuid(), userId: id, note },
      select: {
        token: true,
        note: true,
        createdAt: true,
        lastActivityAt: true,
      },
    })
  }

  /**
   * Gets all sessions of user
   */
  async getAllOfUser({ id }: { id: number }): Promise<Session[]> {
    return await this.prisma.session.findMany({
      where: {
        lastActivityAt: { gt: this.lastActivityLimit },
        userId: id,
      },
    })
  }

  /**
   * Updates sessions of user
   */
  async update(
    { token, note }: { token: string; note: string },
    { id }: { id: number },
  ) {
    const session = await this.prisma.session.findFirst({
      where: { token, userId: id },
    })
    if (!session) {
      throw new NotFoundException('Session not found')
    }

    return await this.prisma.session.update({
      data: { note },
      where: { token },
    })
  }

  /**
   * Deletes session
   * or throws NotFoundException
   */
  async delete(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
    })
    if (!session) {
      throw new NotFoundException('Session not found')
    }
    return await this.prisma.session.delete({ where: { token } })
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
