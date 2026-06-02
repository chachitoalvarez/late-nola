import { useEffect, useMemo, useRef, useState } from 'react'
import { PRODE_FRIEND_PREDICTIONS, PRODE_MATCHES } from '@/data/prodeData'
import { PROJECT_SLUG } from '@/lib/constants'
import { calculatePredictionPoints, getEffectiveMatchStatus } from '@/lib/prode'
import { listMyProdePredictions, saveMyProdePredictions } from '@/services/prode.service'
import type { ProdeGroup, ProdeGroupMember, ProdeMatch, ProdePrediction, ProdeRankingEntry, ResultAuditLog } from '@/types/prode'

interface ProdeState {
  matches: ProdeMatch[]
  predictions: ProdePrediction[]
  groups: ProdeGroup[]
  groupMembers: ProdeGroupMember[]
  auditLogs: ResultAuditLog[]
}

const DEFAULT_STATE: ProdeState = {
  matches: PRODE_MATCHES,
  predictions: [],
  groups: [],
  groupMembers: [],
  auditLogs: [],
}

function loadState(userId: string): ProdeState {
  try {
    const raw = window.localStorage.getItem(`${PROJECT_SLUG}:prode:${userId}`)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as ProdeState
    const savedMatches = parsed.matches?.length === PRODE_MATCHES.length ? parsed.matches : PRODE_MATCHES
    return {
      matches: mergeFixtureMatches(savedMatches),
      predictions: (parsed.predictions ?? []).filter(prediction =>
        PRODE_MATCHES.some(match => match.id === prediction.matchId)
      ),
      groups: parsed.groups ?? [],
      groupMembers: parsed.groupMembers ?? [],
      auditLogs: parsed.auditLogs ?? [],
    }
  } catch {
    return DEFAULT_STATE
  }
}

function mergeFixtureMatches(savedMatches: ProdeMatch[]): ProdeMatch[] {
  const savedByFifaNumber = new Map(savedMatches.map(match => [match.fifaMatchNumber, match]))

  return PRODE_MATCHES.map(match => {
    const saved = savedByFifaNumber.get(match.fifaMatchNumber)
    if (!saved) return match
    return {
      ...match,
      status: saved.status ?? match.status,
      homeScore: saved.homeScore,
      awayScore: saved.awayScore,
      penaltyHomeScore: saved.penaltyHomeScore,
      penaltyAwayScore: saved.penaltyAwayScore,
      qualifiedTeamId: saved.qualifiedTeamId,
      resultUpdatedAt: saved.resultUpdatedAt,
      resultUpdatedBy: saved.resultUpdatedBy,
      winner: saved.winner,
      winnerMatchNumber: saved.winnerMatchNumber,
      loserMatchNumber: saved.loserMatchNumber,
    }
  })
}

function saveState(userId: string, state: ProdeState) {
  window.localStorage.setItem(`${PROJECT_SLUG}:prode:${userId}`, JSON.stringify(state))
}

function createId(prefix: string): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
}

function isKnownPrediction(prediction: ProdePrediction): boolean {
  return PRODE_MATCHES.some(match => match.id === prediction.matchId)
}

function mergePredictions(localPredictions: ProdePrediction[], remotePredictions: ProdePrediction[]): ProdePrediction[] {
  const byMatch = new Map<string, ProdePrediction>()
  for (const prediction of [...localPredictions, ...remotePredictions].filter(isKnownPrediction)) {
    const current = byMatch.get(prediction.matchId)
    if (!current || new Date(prediction.updatedAt).getTime() >= new Date(current.updatedAt).getTime()) {
      byMatch.set(prediction.matchId, prediction)
    }
  }
  return [...byMatch.values()]
}

function buildRanking(predictions: ProdePrediction[], userId: string, userName: string, groupId?: string): ProdeRankingEntry[] {
  const seedUsers = [
    { userId, userName },
    { userId: 'friend-pili', userName: 'Pili' },
    { userId: 'friend-chacho', userName: 'Chacho' },
    { userId: 'friend-fede', userName: 'Fede' },
  ]
  const allPredictions = [...PRODE_FRIEND_PREDICTIONS, ...predictions]
  const rows = seedUsers.map(user => {
    const userPredictions = allPredictions.filter(p => p.userId === user.userId)
    return {
      userId: user.userId,
      userName: user.userName,
      groupId,
      totalPoints: userPredictions.reduce((sum, p) => sum + p.points, 0),
      exactHits: userPredictions.filter(p => p.exactScoreHit).length,
      outcomeHits: userPredictions.filter(p => p.outcomeHit).length,
      predictionsCount: userPredictions.length,
      position: 0,
    }
  })

  return rows
    .sort((a, b) => b.totalPoints - a.totalPoints || b.exactHits - a.exactHits || a.userName.localeCompare(b.userName))
    .map((row, index) => ({ ...row, position: index + 1 }))
}

export function useProde(userId: string, userName: string) {
  const [state, setState] = useState<ProdeState>(() => loadState(userId))
  const loadedBackendUserRef = useRef<string | null>(null)

  const persist = (nextState: ProdeState) => {
    setState(nextState)
    saveState(userId, nextState)
  }

  const predictionsByMatch = useMemo(
    () => new Map(state.predictions.map(prediction => [prediction.matchId, prediction])),
    [state.predictions],
  )

  const pendingMatches = useMemo(
    () => state.matches.filter(match =>
      match.allowsPrediction &&
      !predictionsByMatch.has(match.id) &&
      ['open', 'closing_soon'].includes(getEffectiveMatchStatus(match))
    ),
    [predictionsByMatch, state.matches],
  )

  const rankingGeneral = useMemo(
    () => buildRanking(state.predictions, userId, userName),
    [state.predictions, userId, userName],
  )

  const primaryGroup = state.groups[0] ?? null
  const groupRanking = useMemo(
    () => buildRanking(state.predictions, userId, userName, primaryGroup?.id),
    [primaryGroup?.id, state.predictions, userId, userName],
  )

  useEffect(() => {
    if (!userId || loadedBackendUserRef.current === userId) return
    loadedBackendUserRef.current = userId
    let cancelled = false

    listMyProdePredictions(userName).then(({ data, error }) => {
      if (cancelled || error) return
      setState(prev => {
        const mergedPredictions = mergePredictions(prev.predictions, data)
        const nextState = { ...prev, predictions: mergedPredictions }
        saveState(userId, nextState)
        if (prev.predictions.length > 0 && data.length < mergedPredictions.length) {
          saveMyProdePredictions(mergedPredictions, userName)
        }
        return nextState
      })
    })

    return () => {
      cancelled = true
    }
  }, [userId, userName])

  const savePredictions = (items: Array<{ matchId: string; homeScore: number; awayScore: number; qualifiedTeamId?: string }>): number => {
    const now = new Date().toISOString()
    const nextPredictions = [...state.predictions]
    let savedCount = 0

    for (const item of items) {
      const match = state.matches.find(m => m.id === item.matchId)
      if (!match || !match.allowsPrediction || !['open', 'closing_soon'].includes(getEffectiveMatchStatus(match))) continue
      const scoring = calculatePredictionPoints(match, {
        predictedHomeScore: item.homeScore,
        predictedAwayScore: item.awayScore,
        predictedQualifiedTeamId: item.qualifiedTeamId,
      })
      const existingIndex = nextPredictions.findIndex(p => p.matchId === item.matchId && p.userId === userId)
      const nextPrediction: ProdePrediction = {
        id: existingIndex >= 0 ? nextPredictions[existingIndex].id : createId('pred'),
        userId,
        userName,
        matchId: item.matchId,
        predictedHomeScore: item.homeScore,
        predictedAwayScore: item.awayScore,
        predictedQualifiedTeamId: item.qualifiedTeamId,
        points: scoring.points,
        exactScoreHit: scoring.exactScoreHit,
        outcomeHit: scoring.outcomeHit,
        goalDifferenceHit: scoring.goalDifferenceHit,
        qualifiedTeamHit: scoring.qualifiedTeamHit,
        createdAt: existingIndex >= 0 ? nextPredictions[existingIndex].createdAt : now,
        updatedAt: now,
      }
      if (existingIndex >= 0) nextPredictions[existingIndex] = nextPrediction
      else nextPredictions.push(nextPrediction)
      savedCount += 1
    }

    if (savedCount > 0) {
      persist({ ...state, predictions: nextPredictions })
      void saveMyProdePredictions(
        nextPredictions.filter(prediction =>
          items.some(item => item.matchId === prediction.matchId && prediction.userId === userId)
        ),
        userName,
      ).then(({ data, error }) => {
        if (error || data.length === 0) return
        setState(prev => {
          const mergedPredictions = mergePredictions(prev.predictions, data)
          const nextState = { ...prev, predictions: mergedPredictions }
          saveState(userId, nextState)
          return nextState
        })
      })
    }

    return savedCount
  }

  const updateResult = (matchId: string, patch: Partial<ProdeMatch>) => {
    const match = state.matches.find(m => m.id === matchId)
    if (!match) return
    const updatedMatch: ProdeMatch = {
      ...match,
      ...patch,
      status: patch.status ?? 'points_calculated',
      resultUpdatedAt: new Date().toISOString(),
      resultUpdatedBy: userName,
    }
    const matches = propagateKnockoutResult(
      state.matches.map(item => item.id === matchId ? updatedMatch : item),
      updatedMatch,
    )
    const predictions = state.predictions.map(prediction => {
      if (prediction.matchId !== matchId) return prediction
      const scoring = calculatePredictionPoints(updatedMatch, prediction)
      return { ...prediction, ...scoring, updatedAt: new Date().toISOString(), lockedAt: updatedMatch.startsAt }
    })
    const auditLogs = [
      {
        id: `audit-${crypto.randomUUID()}`,
        matchId,
        previousResult: match,
        newResult: updatedMatch,
        updatedBy: userName,
        updatedAt: new Date().toISOString(),
      },
      ...state.auditLogs,
    ]
    persist({ ...state, matches, predictions, auditLogs })
  }

  const createGroup = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return null
    const group: ProdeGroup = {
      id: `group-${crypto.randomUUID()}`,
      name: trimmed,
      ownerUserId: userId,
      inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
    }
    const member: ProdeGroupMember = {
      id: `member-${crypto.randomUUID()}`,
      groupId: group.id,
      userId,
      userName,
      joinedAt: new Date().toISOString(),
    }
    persist({ ...state, groups: [group, ...state.groups], groupMembers: [member, ...state.groupMembers] })
    return group
  }

  return {
    matches: state.matches,
    predictions: state.predictions,
    predictionsByMatch,
    pendingMatches,
    groups: state.groups,
    groupMembers: state.groupMembers,
    auditLogs: state.auditLogs,
    rankingGeneral,
    primaryGroup,
    groupRanking,
    savePredictions,
    updateResult,
    createGroup,
  }
}

function getWinnerAndLoser(match: ProdeMatch): { winner: ProdeMatchSide; loser: ProdeMatchSide } | null {
  if (match.homeScore === undefined || match.awayScore === undefined) return null

  const homeWins = match.homeScore > match.awayScore
    || (match.homeScore === match.awayScore && (match.penaltyHomeScore ?? -1) > (match.penaltyAwayScore ?? -1))
  const awayWins = match.awayScore > match.homeScore
    || (match.homeScore === match.awayScore && (match.penaltyAwayScore ?? -1) > (match.penaltyHomeScore ?? -1))

  if (!homeWins && !awayWins) return null

  const home = toMatchSide(match, 'home')
  const away = toMatchSide(match, 'away')
  return homeWins ? { winner: home, loser: away } : { winner: away, loser: home }
}

interface ProdeMatchSide {
  teamId: string
  teamName: string
  teamFlag: string
}

function toMatchSide(match: ProdeMatch, side: 'home' | 'away'): ProdeMatchSide {
  return side === 'home'
    ? {
        teamId: match.homeTeamId,
        teamName: match.homeTeamName,
        teamFlag: match.homeTeamFlag,
      }
    : {
        teamId: match.awayTeamId,
        teamName: match.awayTeamName,
        teamFlag: match.awayTeamFlag,
      }
}

function applyResolvedSide(match: ProdeMatch, side: 'home' | 'away', resolved: ProdeMatchSide): ProdeMatch {
  const next = side === 'home'
    ? {
        ...match,
        homeTeamId: resolved.teamId,
        homeTeamName: resolved.teamName,
        homeTeamFlag: resolved.teamFlag,
      }
    : {
        ...match,
        awayTeamId: resolved.teamId,
        awayTeamName: resolved.teamName,
        awayTeamFlag: resolved.teamFlag,
      }

  const bothResolved = !!next.homeTeamFlag && !!next.awayTeamFlag
  return {
    ...next,
    fixtureNeedsResolution: !bothResolved,
    resolvedFromResult: bothResolved,
    allowsPrediction: bothResolved,
  }
}

function propagateKnockoutResult(matches: ProdeMatch[], sourceMatch: ProdeMatch): ProdeMatch[] {
  if (sourceMatch.phase === 'group_stage') return matches
  const result = getWinnerAndLoser(sourceMatch)
  if (!result) return matches

  const winnerSlot = `W${sourceMatch.fifaMatchNumber}`
  const loserSlot = `L${sourceMatch.fifaMatchNumber}`

  return matches.map(match => {
    let next = match
    if (match.homeTeamSlot === winnerSlot || match.homeSlotReference === winnerSlot) {
      next = applyResolvedSide(next, 'home', result.winner)
    }
    if (match.awayTeamSlot === winnerSlot || match.awaySlotReference === winnerSlot) {
      next = applyResolvedSide(next, 'away', result.winner)
    }
    if (match.homeTeamSlot === loserSlot || match.homeSlotReference === loserSlot) {
      next = applyResolvedSide(next, 'home', result.loser)
    }
    if (match.awayTeamSlot === loserSlot || match.awaySlotReference === loserSlot) {
      next = applyResolvedSide(next, 'away', result.loser)
    }
    return next
  })
}
