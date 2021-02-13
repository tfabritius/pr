import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import Big from 'big.js'
import { Exclude, Transform } from 'class-transformer'

import { Security } from '../security.entity'
import { DecimalTransformer } from '../../../utils/DecimalTransformer'

@Entity('portfolios_securities_prices')
export class SecurityPrice {
  @ManyToOne(() => Security, (s: Security) => s.prices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @ApiHideProperty()
  security: Security

  @PrimaryColumn({ nullable: false })
  @Exclude()
  @ApiHideProperty()
  securityId: number

  @PrimaryColumn('date', {
    nullable: false,
  })
  date: string

  @Column('decimal', {
    nullable: false,
    precision: 16,
    scale: 8,
    transformer: new DecimalTransformer(),
  })
  @Transform(({ value }: { value: Big }) => value.toFixed(8), {
    toPlainOnly: true,
  })
  @ApiProperty({ type: String, example: '1.00000000' })
  value: Big
}
