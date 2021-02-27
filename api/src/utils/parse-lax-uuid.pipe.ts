import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'

/**
 * Validates UUID (all versions) with or without dashes
 */
@Injectable()
export class ParseLaxUUIDPipe implements PipeTransform<string> {
  async transform(value: string): Promise<string> {
    const valid =
      /^[0-9a-f]{32}$/.test(value) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        value,
      )
    if (!valid) {
      throw new BadRequestException(`Validation failed (uuid is expected)`)
    }
    return value
  }
}
