import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { AccountType } from './account.entity'
import { Type } from 'class-transformer'

export class AccountIdDto {
  @ApiProperty()
  @IsNumber()
  readonly id: number
}

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
  readonly uuid: string

  @ApiProperty()
  @ValidateIf((o) => o.type === AccountType.DEPOSIT)
  @IsString()
  readonly currencyCode: string

  @ApiProperty()
  @ValidateIf((o) => o.type === AccountType.SECURITIES)
  @ValidateNested()
  @Type(() => AccountIdDto)
  @IsDefined()
  readonly referenceAccount: AccountIdDto

  @ApiProperty()
  @IsString()
  readonly note: string
}
