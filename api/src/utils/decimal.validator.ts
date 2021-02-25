import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator'

@ValidatorConstraint({ name: 'isValidDecimal', async: false })
export class IsValidDecimalConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return {}.toString.call(value).slice(8, -1) === 'Decimal'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return '$property must be a valid decimal'
  }
}

export function IsValidDecimal(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'isValidDecimal',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidDecimalConstraint,
    })
  }
}
