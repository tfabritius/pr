import { ObjectType } from '@nestjs/graphql'
import { Exchangerate } from './exchangerate.entity'

@ObjectType()
export class Currency {
  code: string
  exchangeratesBase: Exchangerate[]
  exchangeratesQuote: Exchangerate[]
}
