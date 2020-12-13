import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional } from 'class-validator'
import * as dayjs from 'dayjs'
import * as customParseFormat from 'dayjs/plugin/customParseFormat'
import { IsValidDayjs } from '../utils/dayjs.validators'

dayjs.extend(customParseFormat)

export class ExchangeRateQuery {
  @IsOptional()
  @Transform((value) => dayjs(value, 'YYYY-MM-DD', true), { toClassOnly: true })
  @IsValidDayjs()
  @ApiPropertyOptional({ example: dayjs().format('YYYY-MM-DD') })
  readonly startDate?: dayjs.Dayjs
}
