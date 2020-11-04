import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SecurityIdDto {
  @ApiProperty()
  @IsNumber()
  readonly id: number
}

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

  @ApiProperty()
  @IsString()
  readonly note: string
}
