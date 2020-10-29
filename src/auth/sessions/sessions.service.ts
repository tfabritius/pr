import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UsersService } from '../users/users.service'
import { User } from '../users/user.entity'
import { Session } from './session.entity'

@Injectable()
export class SessionsService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,

    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {}

  /**
   * Returns configured session timeout
   */
  get sessionTimeout(): number {
    return this.configService.get<number>('SESSION_TIMEOUT', 15 * 60)
  }

  /**
   * Checks token if it belongs to valid session and returns user
   */
  async validateToken(token: string): Promise<User | undefined> {
    try {
      const session = await this.sessionsRepository
        .createQueryBuilder('session')
        .where(
          'EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - session."lastActivityAt"))::integer < :sessionTimeout',
          { sessionTimeout: this.sessionTimeout },
        )
        .andWhere('session.token = :token', { token })
        .innerJoinAndSelect('session.user', 'user')
        .getOne()

      if (!!session && !!session.user) {
        // Update lastActivityAt in background
        session.lastActivityAt = new Date()
        this.sessionsRepository.save(session)

        // Update last seen date in background
        this.usersService.updateLastSeen(session.user)

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
    return await this.sessionsRepository
      .createQueryBuilder('session')
      .where(
        'EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - session."lastActivityAt"))::integer < :sessionTimeout',
        { sessionTimeout: this.sessionTimeout },
      )
      .andWhere('session."userId" = :userId', { userId: user.id })
      .getMany()
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
    await this.sessionsRepository
      .createQueryBuilder()
      .delete()
      .where(
        'EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - "lastActivityAt"))::integer > :sessionTimeout',
        { sessionTimeout: this.sessionTimeout },
      )
      .execute()
  }
}
