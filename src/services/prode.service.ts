import { supabase } from '@/services/supabase'
import type { ProdePrediction } from '@/types/prode'

interface ProdePredictionRow {
  id: string
  user_id: string
  match_id: string
  predicted_home_score: number
  predicted_away_score: number
  predicted_qualified_team_id: string | null
  points: number
  exact_score_hit: boolean
  outcome_hit: boolean
  goal_difference_hit: boolean
  qualified_team_hit: boolean
  locked_at: string | null
  created_at: string
  updated_at: string
}

type SavePredictionInput = Pick<
  ProdePrediction,
  | 'matchId'
  | 'predictedHomeScore'
  | 'predictedAwayScore'
  | 'predictedQualifiedTeamId'
  | 'points'
  | 'exactScoreHit'
  | 'outcomeHit'
  | 'goalDifferenceHit'
  | 'qualifiedTeamHit'
>

function toPrediction(row: ProdePredictionRow, userName: string): ProdePrediction {
  return {
    id: row.id,
    userId: row.user_id,
    userName,
    matchId: row.match_id,
    predictedHomeScore: row.predicted_home_score,
    predictedAwayScore: row.predicted_away_score,
    predictedQualifiedTeamId: row.predicted_qualified_team_id ?? undefined,
    points: row.points,
    exactScoreHit: row.exact_score_hit,
    outcomeHit: row.outcome_hit,
    goalDifferenceHit: row.goal_difference_hit,
    qualifiedTeamHit: row.qualified_team_hit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lockedAt: row.locked_at ?? undefined,
  }
}

export async function listMyProdePredictions(userName: string): Promise<{ data: ProdePrediction[]; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: 'No hay sesión activa' }

  const { data, error } = await supabase
    .from('prode_predictions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return { data: [], error: error.message }
  return { data: ((data ?? []) as ProdePredictionRow[]).map(row => toPrediction(row, userName)), error: null }
}

export async function saveMyProdePredictions(items: SavePredictionInput[], userName: string): Promise<{ data: ProdePrediction[]; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: 'No hay sesión activa' }

  const payload = items.map(item => ({
    user_id: user.id,
    match_id: item.matchId,
    predicted_home_score: item.predictedHomeScore,
    predicted_away_score: item.predictedAwayScore,
    predicted_qualified_team_id: item.predictedQualifiedTeamId ?? null,
    points: item.points,
    exact_score_hit: item.exactScoreHit,
    outcome_hit: item.outcomeHit,
    goal_difference_hit: item.goalDifferenceHit,
    qualified_team_hit: item.qualifiedTeamHit,
  }))

  const { data, error } = await supabase
    .from('prode_predictions')
    .upsert(payload, { onConflict: 'user_id,match_id' })
    .select('*')

  if (error) return { data: [], error: error.message }
  return {
    data: ((data ?? []) as ProdePredictionRow[]).map(row => toPrediction(row, userName)),
    error: null,
  }
}
