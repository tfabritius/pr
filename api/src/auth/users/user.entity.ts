import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { Session } from '../sessions/session.entity'
import { Portfolio } from '../../portfolios/portfolio.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiHideProperty()
  @Exclude()
  id: number

  @Column({ unique: true })
  @Index()
  username: string

  @Column({ select: false, nullable: true })
  @ApiHideProperty()
  @Exclude()
  password: string

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column({
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  lastSeenAt: string

  @OneToMany(() => Session, (session) => session.user)
  @ApiHideProperty()
  sessions: Session[]

  @OneToMany(() => Portfolio, (portfolio) => portfolio.user)
  @ApiHideProperty()
  portfolios: Portfolio[]
}
