import { PortfolioParams } from '../portfolio.params'
import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Parameters (e.g. in URL) used to identify an account
 */
export class AccountParams extends PortfolioParams {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty()
  readonly accountId: number
}
