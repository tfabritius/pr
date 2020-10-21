import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { Session } from '../sessions/session.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number

  @Column({ unique: true })
  @ApiProperty()
  username: string

  @Column({ select: false, nullable: true })
  @Exclude()
  password: string

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty()
  createdAt: Date

  @Column({
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  @ApiProperty()
  lastSeenAt: string

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[]
}
