import { useMemo, useState } from 'react'
import { PRODE_FRIEND_PREDICTIONS, PRODE_MATCHES } from '@/data/prodeData'
import { PROJECT_SLUG } from '@/lib/constants'
import { calculatePredictionPoints, getEffectiveMatchStatus } from '@/lib/prode'
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
    return {
      matches: parsed.matches?.length ? parsed.matches : PRODE_MATCHES,
      predictions: parsed.predictions ?? [],
      groups: parsed.groups ?? [],
      groupMembers: parsed.groupMembers ?? [],
      auditLogs: parsed.auditLogs ?? [],
    }
  } catch {
    return DEFAULT_STATE
  }
}

function saveState(userId: string, state: ProdeState) {
  window.localStorage.setItem(`${PROJECT_SLUG}:prode:${userId}`, JSON.stringify(state))
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

  const persist = (nextState: ProdeState) => {
    setState(nextState)
    saveState(userId, nextState)
  }

  const predictionsByMatch = useMemo(
    () => new Map(state.predictions.map(prediction => [prediction.matchId, prediction])),
    [state.predictions],
  )

  const pendingMatches = useMemo(
    () => state.matches.filter(match => !predictionsByMatch.has(match.id) && ['open', 'closing_soon'].includes(getEffectiveMatchStatus(match))),
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

  const savePredictions = (items: Array<{ matchId: string; homeScore: number; awayScore: number; qualifiedTeamId?: string }>) => {
    const now = new Date().toISOString()
    const nextPredictions = [...state.predictions]

    for (const item of items) {
      const match = state.matches.find(m => m.id === item.matchId)
      if (!match || !['open', 'closing_soon'].includes(getEffectiveMatchStatus(match))) continue
      const scoring = calculatePredictionPoints(match, {
        predictedHomeScore: item.homeScore,
        predictedAwayScore: item.awayScore,
        predictedQualifiedTeamId: item.qualifiedTeamId,
      })
      const existingIndex = nextPredictions.findIndex(p => p.matchId === item.matchId && p.userId === userId)
      const nextPrediction: ProdePrediction = {
        id: existingIndex >= 0 ? nextPredictions[existingIndex].id : `pred-${crypto.randomUUID()}`,
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
    }

    persist({ ...state, predictions: nextPredictions })
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
    const matches = state.matches.map(item => item.id === matchId ? updatedMatch : item)
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

