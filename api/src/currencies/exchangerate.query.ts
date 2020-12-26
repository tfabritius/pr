import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional } from 'class-validator'
import * as dayjs from 'dayjs'
import { parseDayjsYYYYMMDD } from '../utils/parse.dayjs'
import { IsValidDayjs } from '../utils/dayjs.validators'

export class ExchangeRateQuery {
  @IsOptional()
  @Transform(parseDayjsYYYYMMDD, { toClassOnly: true })
  @IsValidDayjs()
  @ApiPropertyOptional({ example: dayjs().format('YYYY-MM-DD') })
  readonly startDate?: dayjs.Dayjs
}
