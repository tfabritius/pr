import { ApiPropertyOptional } from '@nestjs/swagger'
import Big from 'big.js'
import { Transform } from 'class-transformer'

export class SecurityKpis {
  @Transform(({ value }: { value: Big }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  shares?: Big

  @Transform(({ value }: { value: Big }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  quote?: Big

  @Transform(({ value }: { value: Big }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  quoteInBaseCurrency?: Big

  @Transform(({ value }: { value: Big }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  value?: Big

  @Transform(({ value }: { value: Big }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  valueInBaseCurrency?: Big
}
