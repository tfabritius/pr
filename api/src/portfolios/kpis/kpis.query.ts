import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional, IsBoolean, IsString } from 'class-validator'

export class KpisQuery {
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  @IsBoolean()
  @ApiPropertyOptional()
  readonly kpis?: boolean

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  readonly currencyCode?: string
}
