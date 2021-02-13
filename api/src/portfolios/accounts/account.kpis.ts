import { ApiPropertyOptional } from '@nestjs/swagger'
import Big from 'big.js'
import { Transform } from 'class-transformer'

export class AccountKpis {
  @Transform(({ value }: { value: Big }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  balance?: Big

  @Transform(({ value }: { value: Big }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  valueInBaseCurrency?: Big
}
