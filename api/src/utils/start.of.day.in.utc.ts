import { startOfDay } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

export function startOfDayInUtc(date: Date): Date {
  const timeZoneDate = utcToZonedTime(date, 'local')
  const timeZoneStartOfDay = startOfDay(timeZoneDate)
  return zonedTimeToUtc(timeZoneStartOfDay, 'local')
}
