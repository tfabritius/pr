import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeUpdate,
  OneToMany,
  Index,
} from 'typeorm'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { User } from '../auth/users/user.entity'
import { Security } from './securities/security.entity'
import { Account } from './accounts/account.entity'
import { Transaction } from './transactions/transaction.entity'

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number

  @Column()
  @ApiProperty()
  name: string

  @Column()
  @ApiProperty()
  note: string

  @Column()
  @ApiProperty()
  baseCurrencyCode: string

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
  updatedAt: Date

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date()
  }

  @ManyToOne(() => User, (user) => user.portfolios, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index()
  @Exclude()
  @ApiHideProperty()
  user: User

  @OneToMany(() => Security, (s) => s.portfolio)
  @Exclude()
  @ApiHideProperty()
  securities: Security[]

  @OneToMany(() => Account, (a) => a.portfolio)
  @Exclude()
  @ApiHideProperty()
  accounts: Account[]

  @OneToMany(() => Transaction, (t) => t.portfolio)
  @Exclude()
  @ApiHideProperty()
  transactions: Transaction[]
}
