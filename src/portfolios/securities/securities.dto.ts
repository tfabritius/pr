import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SecurityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty()
  @IsString()
  readonly uuid: string

  @ApiProperty()
  @IsString()
  readonly currencyCode: string

  @ApiProperty()
  @IsString()
  readonly isin: string

  @ApiProperty()
  @IsString()
  readonly wkn: string

  @ApiProperty()
  @IsString()
  readonly symbol: string
}
