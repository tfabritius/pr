import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeUpdate,
  OneToMany,
} from 'typeorm'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { User } from '../auth/users/user.entity'
import { Security } from './securities/security.entity'
import { Account } from './accounts/account.entity'
import { Transaction } from './transactions/transaction.entity'
import { Currency } from '../currencies/currency.entity'

@Entity('portfolios')
@ObjectType()
export class Portfolio {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  name: string

  @Column()
  note: string

  @Column({ nullable: false, type: 'character', length: 3 })
  baseCurrencyCode: string

  @ManyToOne(() => Currency, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @ApiHideProperty()
  baseCurrency: Currency

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
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

  @OneToMany(() => Security, (s) => s.portfolio)
  @Exclude()
  @Field(() => [Security])
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
