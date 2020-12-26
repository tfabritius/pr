import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

/**
 * Parameters (e.g. in URL) used to identify an exchange rate
 */
export class ExchangeRateParams {
  @IsString()
  @ApiProperty()
  baseCurrencyCode: string

  @IsString()
  @ApiProperty()
  quoteCurrencyCode: string
}
