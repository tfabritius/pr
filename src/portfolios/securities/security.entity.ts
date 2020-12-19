import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm'
import { Exclude } from 'class-transformer'

import { Portfolio } from '../portfolio.entity'
import { SecurityPrice } from './price.entity'
import { Transaction } from '../transactions/transaction.entity'
import { SecurityKpis } from './security.kpis'

@Entity('securities')
export class Security {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number

  @Column()
  @ApiProperty()
  name: string

  @Column()
  @ApiProperty()
  uuid: string

  @Column()
  @ApiProperty()
  currencyCode: string

  @Column()
  @ApiProperty()
  isin: string

  @Column()
  @ApiProperty()
  wkn: string

  @Column()
  @ApiProperty()
  symbol: string

  @Column()
  @ApiProperty()
  note: string

  @ManyToOne(() => Portfolio, (p) => p.securities, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index()
  @Exclude()
  @ApiHideProperty()
  portfolio: Portfolio

  @OneToMany(() => Transaction, (t) => t.security)
  @ApiHideProperty()
  transactions: Transaction[]

  @OneToMany(() => SecurityPrice, (sp) => sp.security)
  @ApiProperty({ type: SecurityPrice, isArray: true })
  prices: SecurityPrice[]

  @ApiPropertyOptional()
  kpis: SecurityKpis
}
