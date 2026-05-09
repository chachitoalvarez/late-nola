import { supabase } from '@/services/supabase'
import type { TradeMatch, TradeCandidate } from '@/types/trade'

interface TradeMatchRow {
  they_offer: Record<string, Record<string, number>>
  i_offer: Record<string, Record<string, number>>
  they_offer_count: number
  i_offer_count: number
}

interface TradeCandidateRow {
  user_id: string
  username: string
  unique_count: number
  percentage: number
  they_offer_count: number
  i_offer_count: number
  match_score: number
}

export async function getTradeMatch(otherUserId: string): Promise<{ data: TradeMatch | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_trade_match', { p_other_user_id: otherUserId })
  if (error) return { data: null, error: error.message }
  const row = data as TradeMatchRow
  return {
    data: {
      theyOffer: row?.they_offer ?? {},
      iOffer: row?.i_offer ?? {},
      theyOfferCount: row?.they_offer_count ?? 0,
      iOfferCount: row?.i_offer_count ?? 0,
    },
    error: null,
  }
}

export async function getTradeCandidates(limit = 20): Promise<{ data: TradeCandidate[]; error: string | null }> {
  const { data, error } = await supabase.rpc('get_trade_candidates', { p_limit: limit })
  if (error) return { data: [], error: error.message }
  const rows = (data ?? []) as TradeCandidateRow[]
  return {
    data: rows.map(r => ({
      userId: r.user_id,
      username: r.username,
      uniqueCount: r.unique_count,
      percentage: r.percentage,
      theyOfferCount: r.they_offer_count,
      iOfferCount: r.i_offer_count,
      matchScore: r.match_score,
    })),
    error: null,
  }
}
