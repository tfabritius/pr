import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator'

import { AccountType } from './account.entity'

export class AccountDto {
  @IsEnum(AccountType)
  readonly type: AccountType

  @IsString()
  @IsNotEmpty()
  readonly name: string

  @IsString()
  @IsUUID()
  readonly uuid: string

  @ValidateIf((o) => o.type === AccountType.DEPOSIT)
  @IsString()
  readonly currencyCode: string

  @ValidateIf((o) => o.type === AccountType.SECURITIES)
  @IsNumber()
  readonly referenceAccountId: number

  @IsBoolean()
  readonly active: boolean = true

  @IsString()
  readonly note: string
}
