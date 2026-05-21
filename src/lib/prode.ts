import type { MatchStatus, ProdeMatch, ProdePrediction } from '@/types/prode'

export function getEffectiveMatchStatus(match: ProdeMatch, now = new Date()): MatchStatus {
  if (match.status === 'postponed' || match.status === 'cancelled' || match.status === 'points_calculated') return match.status
  if (match.status === 'finished' || match.status === 'live') return match.status
  const startsAt = new Date(match.startsAt)
  if (startsAt <= now) return 'locked'
  const minutesToStart = Math.round((startsAt.getTime() - now.getTime()) / 60000)
  return minutesToStart <= 60 ? 'closing_soon' : 'open'
}

export function isMatchEditable(match: ProdeMatch, now = new Date()): boolean {
  const status = getEffectiveMatchStatus(match, now)
  return status === 'open' || status === 'closing_soon'
}

function sign(value: number): number {
  return value === 0 ? 0 : value > 0 ? 1 : -1
}

export function calculatePredictionPoints(match: ProdeMatch, prediction: Pick<ProdePrediction, 'predictedHomeScore' | 'predictedAwayScore' | 'predictedQualifiedTeamId'>) {
  const realHome = match.homeScore
  const realAway = match.awayScore
  if (realHome === undefined || realAway === undefined) {
    return { points: 0, exactScoreHit: false, outcomeHit: false, goalDifferenceHit: false, qualifiedTeamHit: false, explanation: 'Todavía no hay resultado oficial.' }
  }

  const exactScoreHit = prediction.predictedHomeScore === realHome && prediction.predictedAwayScore === realAway
  const realDiff = realHome - realAway
  const predictedDiff = prediction.predictedHomeScore - prediction.predictedAwayScore
  const outcomeHit = sign(realDiff) === sign(predictedDiff)
  const goalDifferenceHit = outcomeHit && realDiff === predictedDiff

  let points = exactScoreHit ? 5 : goalDifferenceHit ? 3 : outcomeHit ? 1 : 0
  let explanation = exactScoreHit
    ? 'Sumaste 5 pts porque acertaste el marcador exacto.'
    : goalDifferenceHit
      ? 'Sumaste 3 pts porque acertaste ganador y diferencia de gol.'
      : outcomeHit
        ? 'Sumaste 1 pt porque acertaste el ganador o empate.'
        : 'Sumaste 0 pts porque no acertaste el resultado.'

  const isKnockout = match.phase !== 'group_stage'
  const qualifiedTeamHit = !!isKnockout && !!match.qualifiedTeamId && prediction.predictedQualifiedTeamId === match.qualifiedTeamId
  if (qualifiedTeamHit) {
    points += 2
    explanation += ' Sumaste +2 pts extra por acertar quién clasificaba.'
  }

  return { points, exactScoreHit, outcomeHit, goalDifferenceHit, qualifiedTeamHit, explanation }
}

export function formatMatchTime(startsAt: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(startsAt))
}

export function formatTimeToClose(startsAt: string, now = new Date()): string {
  const diff = new Date(startsAt).getTime() - now.getTime()
  if (diff <= 0) return 'Ya cerró'
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours <= 0) return `Cierra en ${remainingMinutes} min`
  return `Cierra en ${hours}h ${remainingMinutes}m`
}

