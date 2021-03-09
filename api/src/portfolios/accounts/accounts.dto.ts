import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator'

import { AccountType } from './account.entity'

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
}
