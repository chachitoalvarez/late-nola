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

type TradeMatchResult =
  | { ok: true; match: TradeMatch }
  | { ok: false; reason: 'not_accessible' | 'unknown'; message: string }

export async function getTradeMatch(otherUserId: string): Promise<TradeMatchResult> {
  console.log('[trades.service] CALLING getTradeMatch with:', otherUserId)
  const { data, error } = await supabase.rpc('get_trade_match', { p_other_user_id: otherUserId })
  console.log('[trades.service] RAW response:', { data, error })
  console.log('[trades.service] Is array?', Array.isArray(data))

  if (error) {
    console.error('[trades.service] ERROR:', error.message)
    const reason = error.message?.includes('User not accessible') ? 'not_accessible' : 'unknown'
    return { ok: false, reason, message: error.message }
  }

  // RETURNS TABLE(...) comes back as array; RETURNS json/record comes back as object
  const row = (Array.isArray(data) ? data[0] : data) as TradeMatchRow | undefined
  console.log('[trades.service] First row:', row)

  if (!row) return { ok: true, match: { theyOffer: {}, iOffer: {}, theyOfferCount: 0, iOfferCount: 0 } }

  const match = {
    theyOffer: row.they_offer ?? {},
    iOffer: row.i_offer ?? {},
    theyOfferCount: row.they_offer_count ?? 0,
    iOfferCount: row.i_offer_count ?? 0,
  }
  console.log('[trades.service] MAPPED result:', match)
  return { ok: true, match }
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
