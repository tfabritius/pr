import { Type } from 'class-transformer'
import {
  IsDateString,
  IsDecimal,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { TransactionType } from './transaction.entity'
import { AccountIdDto } from '../accounts/accounts.dto'
import { SecurityIdDto } from '../securities/securities.dto'
import { UnitType } from './unit.entity'

class TransactionUnitDto {
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

  @ApiPropertyOptional({ example: '0.0000' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,4' })
  readonly exchangeRate: string
}

class PartnerTransactionDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => AccountIdDto)
  @IsDefined()
  readonly account: AccountIdDto

  @ApiPropertyOptional({ isArray: true, type: TransactionUnitDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TransactionUnitDto)
  readonly units: TransactionUnitDto[]

  @ApiPropertyOptional({ example: '0.000000' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,6' })
  readonly shares: string

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  readonly security: SecurityIdDto
}

export class TransactionDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => AccountIdDto)
  @IsDefined()
  readonly account: AccountIdDto

  @ApiProperty({ enum: TransactionType, enumName: 'TransactionType' })
  @IsEnum(TransactionType)
  readonly type: TransactionType

  @ApiProperty()
  @IsDateString()
  readonly datetime: Date

  @ApiPropertyOptional({ type: PartnerTransactionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartnerTransactionDto)
  readonly partnerTransaction: PartnerTransactionDto

  @ApiPropertyOptional({ isArray: true, type: TransactionUnitDto })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TransactionUnitDto)
  readonly units: TransactionUnitDto[]

  @ApiPropertyOptional({ example: '0.000000' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,6' })
  readonly shares: string

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  readonly security: SecurityIdDto

  @ApiProperty()
  @IsString()
  readonly note: string
}
