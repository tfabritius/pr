export class StatsVersionResponseDto {
  version: string
  count: number
  firstUpdate: Date
  lastUpdate: Date
}

class ByCountry {
  country: string
  count: number
}

class ByDate {
  date: string
  count: number
}

export class StatsVersionDetailsResponseDto {
  byCountry: ByCountry[]
  byDate: ByDate[]
}
