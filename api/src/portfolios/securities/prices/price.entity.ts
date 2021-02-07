import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import Big from 'big.js'
import { Exclude, Transform } from 'class-transformer'
import * as dayjs from 'dayjs'

import { Security } from '../security.entity'
import { DecimalTransformer } from '../../../utils/DecimalTransformer'

@Entity('portfolios_securities_prices')
export class SecurityPrice {
  @ManyToOne(() => Security, (s: Security) => s.prices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  security: Security

  @PrimaryColumn({ nullable: false })
  @Exclude()
  securityId: number

  @PrimaryColumn('date', {
    nullable: false,
  })
  @ApiProperty({ example: dayjs().format('YYYY-MM-DD') })
  date: string

  @Column('decimal', {
    nullable: false,
    precision: 16,
    scale: 8,
    transformer: new DecimalTransformer(),
  })
  @Transform((value: Big) => value.toFixed(8), { toPlainOnly: true })
  @ApiProperty({ type: String, example: '1.00000000' })
  value: Big
}
