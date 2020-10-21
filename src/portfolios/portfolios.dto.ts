import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class PortfolioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty()
  @IsString()
  readonly description: string

  @ApiProperty()
  @IsString()
  readonly baseCurrencyCode: string
}
