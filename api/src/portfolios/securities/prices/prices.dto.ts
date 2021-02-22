import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsDecimal, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export class SecurityPriceDto {
  @ApiProperty({ type: String, example: 'YYYY-MM-DD' })
  @Type(() => Date)
  @IsDate()
  readonly date: Date

  @IsString()
  @IsDecimal({ decimal_digits: '0,8' })
  readonly value: string
}
