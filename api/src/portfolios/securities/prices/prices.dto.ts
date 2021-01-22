import { IsDecimal, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import * as dayjs from 'dayjs'

import { IsValidDayjs } from '../../../utils/dayjs.validators'
import { parseDayjsYYYYMMDD } from '../../../utils/parse.dayjs'

export class SecurityPriceDto {
  @ApiProperty()
  @Transform(parseDayjsYYYYMMDD, { toClassOnly: true })
  @IsValidDayjs()
  readonly date: dayjs.Dayjs

  @ApiProperty()
  @IsString()
  @IsDecimal({ decimal_digits: '0,8' })
  readonly value: string
}
