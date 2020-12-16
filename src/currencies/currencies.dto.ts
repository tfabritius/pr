import { IsDecimal, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ConvertCurrenciesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly sourceCurrencyCode: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly targetCurrencyCode: string

  @ApiProperty({ example: '1.00' })
  @IsDecimal()
  readonly sourceAmount: string
}
