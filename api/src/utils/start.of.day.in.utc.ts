export function startOfDayInUtc(date: Date): Date {
  const startOfDayInUtc = new Date(date.valueOf())
  startOfDayInUtc.setUTCHours(0)
  startOfDayInUtc.setUTCMinutes(0)
  startOfDayInUtc.setUTCSeconds(0)
  startOfDayInUtc.setUTCMilliseconds(0)
  return startOfDayInUtc
}
