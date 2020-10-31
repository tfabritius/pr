import { PortfolioParams } from '../portfolio.params'
import { IsNumberString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Parameters (e.g. in URL) used to identify an account
 */
export class AccountParams extends PortfolioParams {
  @IsNumberString()
  @ApiProperty()
  readonly accountId: number
}
