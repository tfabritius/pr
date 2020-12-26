import { IsDecimal, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import * as dayjs from 'dayjs'

import { IsValidDayjs } from '../utils/dayjs.validators'
import { parseDayjsYYYYMMDD } from '../utils/parse.dayjs'

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

  @IsOptional()
  @Transform(parseDayjsYYYYMMDD, { toClassOnly: true })
  @IsValidDayjs()
  @ApiPropertyOptional({ type: String, example: dayjs().format('YYYY-MM-DD') })
  readonly date?: dayjs.Dayjs
}
