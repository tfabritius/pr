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

  @ApiPropertyOptional()
  kpis: SecurityKpis
}
