import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeUpdate,
} from 'typeorm'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { User } from '../auth/users/user.entity'

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number

  @Column()
  @ApiProperty()
  name: string

  @Column({ default: '' })
  @ApiProperty()
  description: string

  @Column({ default: 'EUR' })
  @ApiProperty()
  baseCurrencyCode: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty()
  createdAt: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty()
  updatedAt: Date

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date()
  }

  @ManyToOne(() => User, (user) => user.portfolios, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Exclude()
  @ApiHideProperty()
  user: User
}
