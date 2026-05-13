import { supabase } from '@/services/supabase'
import type { TradeMatch, TradeCandidate, TradeUser } from '@/types/trade'

interface TradeMatchRow {
  they_offer: Record<string, number>
  i_offer: Record<string, number>
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

interface TradeLikeRow {
  user_id?: string
  other_user_id?: string
  to_user_id?: string
  from_user_id?: string
  username?: string
  other_username?: string
  from_username?: string
  to_username?: string
  they_offer_count?: number
  i_offer_count?: number
  match_score?: number
}

type TradeMatchResult =
  | { ok: true; match: TradeMatch }
  | { ok: false; reason: 'not_accessible' | 'unknown'; message: string }

export async function getTradeMatch(otherUserId: string): Promise<TradeMatchResult> {
  const { data, error } = await supabase.rpc('get_trade_match', { p_other_user_id: otherUserId })

  if (error) {
    const reason = error.message?.includes('User not accessible') ? 'not_accessible' : 'unknown'
    return { ok: false, reason, message: error.message }
  }

  // RETURNS TABLE(...) comes back as array; RETURNS json/record comes back as object
  const row = (Array.isArray(data) ? data[0] : data) as TradeMatchRow | undefined

  if (!row) return { ok: true, match: { theyOffer: {}, iOffer: {}, theyOfferCount: 0, iOfferCount: 0 } }

  return {
    ok: true,
    match: {
      theyOffer: row.they_offer ?? {},
      iOffer: row.i_offer ?? {},
      theyOfferCount: row.they_offer_count ?? 0,
      iOfferCount: row.i_offer_count ?? 0,
    },
  }
}

export async function getTradeCandidates(limit = 20): Promise<{ data: TradeCandidate[]; error: string | null }> {
  const { data, error } = await supabase.rpc('get_trade_candidates', { p_limit: limit })
  if (error) {
    console.error('[getTradeCandidates] ERROR:', { message: error.message, details: error.details, hint: error.hint, code: error.code })
    return { data: [], error: error.message }
  }
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

function mapTradeUser(row: TradeLikeRow): TradeUser {
  const id = row.user_id ?? row.other_user_id ?? row.to_user_id ?? row.from_user_id ?? ''
  const name = row.username ?? row.other_username ?? row.to_username ?? row.from_username ?? 'usuario'
  const matchScore = Math.round(row.match_score ?? 0)
  return {
    id,
    name,
    distance: matchScore > 0 ? `${matchScore}% compatibilidad` : 'Cruce pendiente',
    hasForYou: row.they_offer_count ?? 0,
    youHaveForThem: row.i_offer_count ?? 0,
    offers: [],
  }
}

function localSentKey(userId: string) {
  return `tracker-mundial-trade-likes-sent:${userId}`
}

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? ''
}

function readLocalSent(userId: string): TradeUser[] {
  try {
    return JSON.parse(localStorage.getItem(localSentKey(userId)) ?? '[]') as TradeUser[]
  } catch {
    return []
  }
}

function writeLocalSent(userId: string, users: TradeUser[]) {
  localStorage.setItem(localSentKey(userId), JSON.stringify(users))
}

export async function listSentLikes(): Promise<{ data: TradeUser[]; error: string | null }> {
  const { data, error } = await supabase.rpc('list_trade_likes_sent')
  if (!error) {
    const rows = (data ?? []) as TradeLikeRow[]
    return { data: rows.map(mapTradeUser), error: null }
  }

  const userId = await getCurrentUserId()
  return { data: userId ? readLocalSent(userId) : [], error: null }
}

export async function listReceivedLikes(): Promise<{ data: TradeUser[]; error: string | null }> {
  const { data, error } = await supabase.rpc('list_trade_likes_received')
  if (error) return { data: [], error: null }
  const rows = (data ?? []) as TradeLikeRow[]
  return { data: rows.map(mapTradeUser), error: null }
}

export async function sendTradeLike(user: TradeUser): Promise<{ matched: boolean; error: string | null }> {
  const { data, error } = await supabase.rpc('send_trade_like', { p_other_user_id: String(user.id) })
  if (!error) {
    const row = Array.isArray(data) ? data[0] : data
    return { matched: Boolean(row?.matched ?? row?.is_match ?? false), error: null }
  }

  const userId = await getCurrentUserId()
  if (userId) {
    const current = readLocalSent(userId)
    if (!current.some(item => String(item.id) === String(user.id))) {
      writeLocalSent(userId, [...current, user])
    }
  }
  return { matched: false, error: null }
}

export async function acceptTradeLike(user: TradeUser): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('accept_trade_like', { p_other_user_id: String(user.id) })
  return { error: error?.message ?? null }
}

export async function rejectTradeLike(user: TradeUser): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('reject_trade_like', { p_other_user_id: String(user.id) })
  return { error: error?.message ?? null }
}
