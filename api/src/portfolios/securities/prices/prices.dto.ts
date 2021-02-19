import { ApiProperty } from '@nestjs/swagger'
import { IsDecimal, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import * as dayjs from 'dayjs'

import { IsValidDayjs } from '../../../utils/dayjs.validators'
import { parseDayjsYYYYMMDD } from '../../../utils/parse.dayjs'

export class SecurityPriceDto {
  @Transform(parseDayjsYYYYMMDD, { toClassOnly: true })
  @IsValidDayjs()
  @ApiProperty({ type: String, example: dayjs().format('YYYY-MM-DD') })
  readonly date: dayjs.Dayjs

  @IsString()
  @IsDecimal({ decimal_digits: '0,8' })
  readonly value: string
}
