import type { TradeUser } from '@/types/trade'

export const mockTradeUsers: TradeUser[] = [
  { id: 101, name: 'Carlos T.', distance: 'a 2 km', hasForYou: 5, youHaveForThem: 3, offers: ['ARG-10', 'BRA-9', 'ESP-1', 'FRA-7', 'URU-9'] },
  { id: 102, name: 'Julieta M.', distance: 'a 5 km', hasForYou: 12, youHaveForThem: 1, offers: ['ENG-10', 'GER-8', 'MEX-4', 'USA-2', '...'] },
  { id: 103, name: 'Fede R.', distance: 'a 800 m', hasForYou: 2, youHaveForThem: 8, offers: ['POR-7', 'ITA-9'] },
  { id: 104, name: 'Valentina P.', distance: 'a 12 km', hasForYou: 1, youHaveForThem: 0, offers: ['ARG-1 (Dibu)'] },
  { id: 105, name: 'Gonzalo H.', distance: 'a 3 km', hasForYou: 8, youHaveForThem: 5, offers: ['CRO-10', 'BEL-7', 'NED-4', '...'] },
]

export const initialLikedByThem: TradeUser[] = [
  { id: 201, name: 'Pedro K.', distance: 'a 1 km', hasForYou: 2, youHaveForThem: 4, offers: ['QAT-2', 'SEN-5'] },
  { id: 202, name: 'Lucía F.', distance: 'a 6 km', hasForYou: 7, youHaveForThem: 1, offers: ['BRA-1', 'ARG-5'] },
]
