import { Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { ObjectType } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'
import { ExchangeRate } from './exchangerate.entity'

@Entity('currencies')
@ObjectType()
export class Currency {
  @PrimaryColumn({ type: 'character', length: 3 })
  code: string

  @OneToMany(() => ExchangeRate, (er) => er.baseCurrency)
  @ApiHideProperty()
  exchangeRatesBase: ExchangeRate[]

  @OneToMany(() => ExchangeRate, (er) => er.quoteCurrency)
  @ApiHideProperty()
  exchangeRatesQuote: ExchangeRate[]
}
