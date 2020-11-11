import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThan, MoreThan, Repository } from 'typeorm'

import { UsersService } from '../users/users.service'
import { User } from '../users/user.entity'
import { Session } from './session.entity'

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name)

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,

    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
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
      const session = await this.sessionsRepository.findOne(token, {
        where: { lastActivityAt: MoreThan(this.lastActivityLimit) },
        relations: ['user'],
      })

      if (!!session && !!session.user) {
        // Update lastActivityAt in background
        session.lastActivityAt = new Date()
        this.sessionsRepository.save(session).catch((e) => {
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
    const session = new Session()
    session.user = user
    return await this.sessionsRepository.save(session)
  }

  /**
   * Gets all sessions of user
   */
  async getAllOfUser(user: User): Promise<Session[]> {
    return await this.sessionsRepository.find({
      where: {
        lastActivityAt: MoreThan(this.lastActivityLimit),
        user,
      },
    })
  }

  /**
   * Deletes session
   * or throws NotFoundException
   */
  async delete(token: string): Promise<void> {
    const { affected } = await this.sessionsRepository.delete(token)
    if (affected == 0) {
      throw new NotFoundException('Session not found')
    }
  }

  /**
   * Deletes expired sessions
   */
  async cleanupExpired(): Promise<void> {
    await this.sessionsRepository.delete({
      lastActivityAt: LessThan(this.lastActivityLimit),
    })
  }
}
