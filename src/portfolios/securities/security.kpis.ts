import { ApiPropertyOptional } from '@nestjs/swagger'
import Big from 'big.js'
import { Transform } from 'class-transformer'

export class SecurityKpis {
  @Transform((value: Big) => value.toString(), { toPlainOnly: true })
  @ApiPropertyOptional({ type: String })
  shares?: Big
}
