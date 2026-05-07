export interface TradeUser {
  id: number
  name: string
  distance: string
  hasForYou: number
  youHaveForThem: number
  offers: string[]
}

export interface Connection extends TradeUser {
  isNew: boolean
  hasUnread: boolean
}
