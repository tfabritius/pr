import { PortfolioParams } from '../portfolio.params'
import { IsNumberString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Parameters (e.g. in URL) used to identify a security
 */
export class SecurityParams extends PortfolioParams {
  @IsNumberString()
  @ApiProperty()
  securityId: number
}
