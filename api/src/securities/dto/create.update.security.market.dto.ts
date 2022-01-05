import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { CreateUpdateSecurityMarketPriceDto } from './create.update.security.market.price.dto'

export class CreateUpdateSecurityMarketDto {
  @IsOptional()
  @IsString()
  currencyCode?: string

  @IsOptional()
  @IsString()
  symbol?: string

  @IsOptional()
  @IsBoolean()
  updatePrices: boolean

  @IsOptional()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => CreateUpdateSecurityMarketPriceDto)
  prices?: CreateUpdateSecurityMarketPriceDto[]
}
