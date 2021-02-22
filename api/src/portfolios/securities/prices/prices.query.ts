import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDate, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'

export class PricesQuery {
  @IsOptional()
  @ApiPropertyOptional({ type: String, example: 'YYYY-MM-DD' })
  @Type(() => Date)
  @IsDate()
  readonly startDate?: Date

  @IsOptional()
  @ApiPropertyOptional({ type: String, example: 'YYYY-MM-DD' })
  @Type(() => Date)
  @IsDate()
  readonly endDate?: Date
}
