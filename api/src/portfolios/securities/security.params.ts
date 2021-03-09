import { PortfolioParams } from '../portfolio.params'
import { IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Parameters (e.g. in URL) used to identify a security
 */
export class SecurityParams extends PortfolioParams {
  @IsUUID()
  @ApiProperty()
  securityUuid: string
}
