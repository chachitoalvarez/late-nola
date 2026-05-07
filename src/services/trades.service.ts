// TODO: replace mock returns with Supabase calls when integrating
import { mockTradeUsers } from '@/data/mockTradeUsers'
import type { TradeUser } from '@/types/trade'

export async function listConnections(): Promise<TradeUser[]> {
  return mockTradeUsers
}

export async function sendLike(_userId: number): Promise<void> {
  // TODO: supabase.from('likes').insert(...)
}

export async function acceptLike(_userId: number): Promise<void> {
  // TODO: supabase.from('connections').insert(...)
}
