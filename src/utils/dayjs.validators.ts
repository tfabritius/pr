import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator'
import * as dayjs from 'dayjs'

@ValidatorConstraint({ name: 'isValidDayjs', async: false })
export class IsValidDayjsConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any, args: ValidationArguments) {
    return dayjs.isDayjs(value) && value.isValid()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return '$property must be a valid date'
  }
}

export function IsValidDayjs(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'isValidDayjs',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidDayjsConstraint,
    })
  }
}
