import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

import { User } from '../users/user.entity'
import { Exclude } from 'class-transformer'

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  token: string

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty()
  createdAt: Date

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty()
  lastActivityAt: Date

  @ManyToOne(() => User, (user) => user.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Exclude()
  user: User
}
