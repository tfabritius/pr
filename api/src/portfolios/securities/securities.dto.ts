import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator'

export class SecurityIdDto {
  @IsNumber()
  readonly id: number
}

export class SecurityDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @IsString()
  @IsUUID()
  readonly uuid: string

  @IsString()
  readonly currencyCode: string

  @IsString()
  readonly isin: string

  @IsString()
  readonly wkn: string

  @IsString()
  readonly symbol: string

  @IsBoolean()
  readonly active: boolean = true

  @IsString()
  readonly note: string
}
