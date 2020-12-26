import { ValueTransformer } from 'typeorm'
import Big from 'big.js'

export class DecimalTransformer implements ValueTransformer {
  from(value: string | null): Big | null {
    return value ? Big(value) : null
  }

  to(value: Big | null): string | null {
    return value ? value.toString() : null
  }
}
