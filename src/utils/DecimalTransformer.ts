import { ValueTransformer } from 'typeorm'
import Big from 'big.js'

export class DecimalTransformer implements ValueTransformer {
  from(value: string): Big {
    return new Big(value)
  }

  to(value: Big): string {
    return value.toString()
  }
}
