export interface Account {
  uuid: string
  type: 'securities' | 'deposit'
  name: string
  currencyCode: string
  referenceAccountId: number
  note: string
}
