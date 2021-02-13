import * as dayjs from 'dayjs'
import * as customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export function parseDayjsYYYYMMDD({ value }: { value: string }): dayjs.Dayjs {
  return dayjs(value, 'YYYY-MM-DD', true)
}
