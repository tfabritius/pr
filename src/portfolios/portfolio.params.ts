import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString } from 'class-validator'

/**
 * Parameters (e.g. in URL) used to identify a portfolio
 */
export class PortfolioParams {
  @IsNumberString()
  @ApiProperty()
  portfolioId: number
}
