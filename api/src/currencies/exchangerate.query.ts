import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsOptional } from 'class-validator'

export class ExchangeRateQuery {
  @IsOptional()
  @ApiPropertyOptional({ type: String, example: 'YYYY-MM-DD' })
  @Type(() => Date)
  @IsDate()
  readonly startDate?: Date
}
