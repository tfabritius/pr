import { IsNumberString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { PortfolioParams } from '../portfolio.params'

/**
 * Parameters (e.g. in URL) used to identify a transaction
 */
export class TransactionParams extends PortfolioParams {
  @IsNumberString()
  @ApiProperty()
  readonly transactionId: number
}
