export interface Account {
  id: number
  type: 'securities' | 'deposit'
  name: string
  uuid: string
  currencyCode: string
  referenceAccountId: number
  note: string
}
