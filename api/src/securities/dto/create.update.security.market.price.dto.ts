import { IsNumber, IsString } from 'class-validator'

export class CreateUpdateSecurityMarketPriceDto {
  @IsString()
  date: string

  @IsNumber()
  close: number
}
