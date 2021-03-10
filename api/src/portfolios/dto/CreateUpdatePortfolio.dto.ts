import { IsNotEmpty, IsString } from 'class-validator'

export class CreateUpdatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @IsString()
  readonly note: string

  @IsString()
  readonly baseCurrencyCode: string
}
