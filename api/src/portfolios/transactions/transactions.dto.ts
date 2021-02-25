import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import {
  IsDefined,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

import { parseDecimal } from '../../utils/decimal.parser'
import { IsValidDecimal } from '../../utils/decimal.validator'
import { TransactionType } from './transaction.entity'
import { UnitType } from './unit.entity'

export class TransactionUnitDto {
  @IsOptional()
  @IsNumber()
  readonly id?: number

  @IsEnum(UnitType)
  readonly type: UnitType

  @Transform(parseDecimal)
  @IsValidDecimal()
  @ApiProperty({ type: String, example: '1.0' })
  readonly amount: Prisma.Decimal

  @IsString()
  readonly currencyCode: string

  @IsOptional()
  @Transform(parseDecimal)
  @IsValidDecimal()
  @ApiPropertyOptional({ type: String, example: '1.0' })
  readonly originalAmount?: Prisma.Decimal

  @IsOptional()
  @IsString()
  readonly originalCurrencyCode?: string

  @IsOptional()
  @Transform(parseDecimal)
  @IsValidDecimal()
  @ApiPropertyOptional({ type: String, example: '1.0' })
  readonly exchangeRate?: Prisma.Decimal
}

class PartnerTransactionDto {
  @IsNumber()
  readonly accountId: number

  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => TransactionUnitDto)
  readonly units: TransactionUnitDto[]

  @IsOptional()
  @Transform(parseDecimal)
  @IsValidDecimal()
  @ApiPropertyOptional({ type: String, example: '1.0' })
  readonly shares?: Prisma.Decimal

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
  @Transform(parseDecimal)
  @IsValidDecimal()
  @ApiPropertyOptional({ type: String, example: '1.0' })
  readonly shares?: Prisma.Decimal

  @IsOptional()
  @IsNumber()
  readonly securityId?: number

  @IsString()
  readonly note: string
}
