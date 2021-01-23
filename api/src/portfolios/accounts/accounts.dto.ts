import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { AccountType } from './account.entity'

export class AccountDto {
  @ApiProperty({ enum: AccountType, enumName: 'AccountType' })
  @IsEnum(AccountType)
  readonly type: AccountType

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ApiProperty()
  @IsString()
  @IsUUID()
  readonly uuid: string

  @ApiProperty()
  @ValidateIf((o) => o.type === AccountType.DEPOSIT)
  @IsString()
  readonly currencyCode: string

  @ApiProperty()
  @ValidateIf((o) => o.type === AccountType.SECURITIES)
  @IsNumber()
  readonly referenceAccountId: number

  @ApiProperty()
  @IsBoolean()
  readonly active: boolean = true

  @ApiProperty()
  @IsString()
  readonly note: string
}
