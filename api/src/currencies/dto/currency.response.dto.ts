import { ExchangerateResponseDto } from './exchangerate.response.dto'

export class CurrencyResponseDto {
  code: string

  exchangeratesBase: ExchangerateResponseDto[]
  exchangeratesQuote: ExchangerateResponseDto[]
}
