import { PortfolioParams } from '../portfolio.params'
import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Parameters (e.g. in URL) used to identify a security
 */
export class SecurityParams extends PortfolioParams {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty()
  securityId: number
}
