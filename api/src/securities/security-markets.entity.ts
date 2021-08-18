import { Field, ObjectType } from '@nestjs/graphql'

import { permitAdminMiddleware } from '../auth/permit-admin.middleware'

@ObjectType()
export class SecurityMarket {
  securityUuid: string
  marketCode: string
  currencyCode: string
  firstPriceDate?: Date
  lastPriceDate?: Date
  symbol?: string

  @Field({ middleware: [permitAdminMiddleware] })
  updatePrices: boolean
}
