import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Exclude } from 'class-transformer'

import { Portfolio } from '../portfolio.entity'

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

  @ManyToOne(() => Portfolio, (p) => p.securities, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Exclude()
  @ApiHideProperty()
  portfolio: Portfolio
}
