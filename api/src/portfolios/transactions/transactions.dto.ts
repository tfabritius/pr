import { Type } from 'class-transformer'
import {
  IsDecimal,
  IsDefined,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

import { TransactionType } from './transaction.entity'
import { UnitType } from './unit.entity'

export class TransactionUnitDto {
  @IsOptional()
  @IsNumber()
  readonly id?: number

  @IsEnum(UnitType)
  readonly type: UnitType

  @IsDecimal({ decimal_digits: '0,2' })
  readonly amount: string

  @IsString()
  readonly currencyCode: string

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  readonly originalAmount?: string

  @IsOptional()
  @IsString()
  readonly originalCurrencyCode?: string

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,8' })
  readonly exchangeRate?: string
}

class PartnerTransactionDto {
  @IsNumber()
  readonly accountId: number

  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => TransactionUnitDto)
  readonly units: TransactionUnitDto[]

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,8' })
  readonly shares?: string

  @IsOptional()
  @IsNumber()
  readonly securityId?: number
}

export class TransactionDto {
  @IsNumber()
  readonly accountId: number

  @IsEnum(TransactionType)
  readonly type: TransactionType

  @IsISO8601()
  readonly datetime: Date

  @IsOptional()
  @ValidateNested()
  @Type(() => PartnerTransactionDto)
  readonly partnerTransaction?: PartnerTransactionDto

  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => TransactionUnitDto)
  readonly units: TransactionUnitDto[]

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,8' })
  readonly shares?: string

  @IsOptional()
  @IsNumber()
  readonly securityId?: number

  @IsString()
  readonly note: string
}
