import { IsDecimal, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import * as dayjs from 'dayjs'

import { IsValidDayjs } from '../utils/dayjs.validators'
import { parseDayjsYYYYMMDD } from '../utils/parse.dayjs'

export class ConvertCurrenciesDto {
  @IsString()
  @IsNotEmpty()
  readonly sourceCurrencyCode: string

  @IsString()
  @IsNotEmpty()
  readonly targetCurrencyCode: string

  @IsDecimal()
  readonly sourceAmount: string

  @IsOptional()
  @Transform(parseDayjsYYYYMMDD, { toClassOnly: true })
  @IsValidDayjs()
  @ApiPropertyOptional({ type: String, example: dayjs().format('YYYY-MM-DD') })
  readonly date?: dayjs.Dayjs
}
