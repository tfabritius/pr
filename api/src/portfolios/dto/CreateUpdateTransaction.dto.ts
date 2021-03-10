import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import {
  IsDate,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'

import { parseDecimal } from '../../utils/decimal.parser'
import { IsValidDecimal } from '../../utils/decimal.validator'
import { TransactionType } from '../transactions/transaction.entity'
import { UnitType } from '../transactions/unit.entity'

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

export class CreateUpdateTransactionDto {
  @IsUUID()
  readonly accountUuid: string

  @IsEnum(TransactionType)
  readonly type: TransactionType

  @Type(() => Date)
  @IsDate()
  readonly datetime: Date

  @IsOptional()
  @IsUUID()
  readonly partnerTransactionUuid?: string

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
  @IsUUID()
  readonly portfolioSecurityUuid?: string

  @IsOptional()
  @IsString()
  readonly note?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly updatedAt?: Date = new Date()
}
