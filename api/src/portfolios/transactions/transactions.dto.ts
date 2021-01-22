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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { TransactionType } from './transaction.entity'
import { UnitType } from './unit.entity'

export class TransactionUnitDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly id: number

  @ApiProperty({ enum: UnitType, enumName: 'UnitType' })
  @IsEnum(UnitType)
  readonly type: UnitType

  @ApiProperty({ example: '0.00' })
  @IsDecimal({ decimal_digits: '0,2' })
  readonly amount: string

  @ApiProperty()
  @IsString()
  readonly currencyCode: string

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  readonly originalAmount: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly originalCurrencyCode: string

  @ApiPropertyOptional({ example: '0.00000000' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,8' })
  readonly exchangeRate: string
}

class PartnerTransactionDto {
  @ApiProperty()
  @IsNumber()
  readonly accountId: number

  @ApiProperty({ isArray: true, type: TransactionUnitDto })
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => TransactionUnitDto)
  readonly units: TransactionUnitDto[]

  @ApiPropertyOptional({ example: '0.00000000' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,8' })
  readonly shares: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly securityId: number
}

export class TransactionDto {
  @ApiProperty()
  @IsNumber()
  readonly accountId: number

  @ApiProperty({ enum: TransactionType, enumName: 'TransactionType' })
  @IsEnum(TransactionType)
  readonly type: TransactionType

  @ApiProperty()
  @IsISO8601()
  readonly datetime: Date

  @ApiPropertyOptional({ type: PartnerTransactionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartnerTransactionDto)
  readonly partnerTransaction: PartnerTransactionDto

  @ApiProperty({ isArray: true, type: TransactionUnitDto })
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => TransactionUnitDto)
  readonly units: TransactionUnitDto[]

  @ApiPropertyOptional({ example: '0.00000000' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,8' })
  readonly shares: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly securityId: number

  @ApiProperty()
  @IsString()
  readonly note: string
}
