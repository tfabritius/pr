import { Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { ExchangeRate } from './exchangerate.entity'

@Entity('currencies')
export class Currency {
  @PrimaryColumn({ type: 'character', length: 3 })
  @ApiProperty()
  code: string

  @OneToMany(() => ExchangeRate, (er) => er.baseCurrency)
  exchangeRatesBase: ExchangeRate[]

  @OneToMany(() => ExchangeRate, (er) => er.quoteCurrency)
  exchangeRatesQuote: ExchangeRate[]
}
