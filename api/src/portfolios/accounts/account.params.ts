import { PortfolioParams } from '../portfolio.params'
import { IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Parameters (e.g. in URL) used to identify an account
 */
export class AccountParams extends PortfolioParams {
  @IsUUID()
  @ApiProperty()
  readonly accountUuid: string
}
