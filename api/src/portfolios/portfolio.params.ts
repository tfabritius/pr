import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'

/**
 * Parameters (e.g. in URL) used to identify a portfolio
 */
export class PortfolioParams {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty()
  portfolioId: number
}
