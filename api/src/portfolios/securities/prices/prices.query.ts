import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'
import * as dayjs from 'dayjs'

import { parseDayjsYYYYMMDD } from '../../../utils/parse.dayjs'
import { IsValidDayjs } from '../../../utils/dayjs.validators'

export class PricesQuery {
  @IsOptional()
  @Transform(parseDayjsYYYYMMDD, { toClassOnly: true })
  @IsValidDayjs()
  @ApiPropertyOptional({ example: dayjs().format('YYYY-MM-DD') })
  readonly startDate?: dayjs.Dayjs

  @IsOptional()
  @Transform(parseDayjsYYYYMMDD, { toClassOnly: true })
  @IsValidDayjs()
  @ApiPropertyOptional({ example: dayjs().format('YYYY-MM-DD') })
  readonly endDate?: dayjs.Dayjs
}
