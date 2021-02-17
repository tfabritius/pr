import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { ObjectType, Field } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'

import { User } from '../users/user.entity'
import { Exclude } from 'class-transformer'

@Entity('sessions')
@ObjectType()
export class Session {
  @PrimaryColumn({ type: 'character', length: 36 })
  @Field()
  token: string

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastActivityAt: Date

  @ManyToOne(() => User, (user) => user.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @ApiHideProperty()
  @Exclude()
  user: User
}
