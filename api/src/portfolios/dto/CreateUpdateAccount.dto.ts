import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator'

import { AccountType } from '../accounts/account.entity'

export class CreateUpdateAccountDto {
  @IsEnum(AccountType)
  readonly type: AccountType

  @IsString()
  @IsNotEmpty()
  readonly name: string

  @ValidateIf((o) => o.type === AccountType.DEPOSIT)
  @IsString()
  readonly currencyCode: string

  @ValidateIf((o) => o.type === AccountType.SECURITIES)
  @IsUUID()
  readonly referenceAccountUuid: string

  @IsBoolean()
  readonly active: boolean = true

  @IsOptional()
  @IsString()
  readonly note?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly updatedAt?: Date = new Date()
}
