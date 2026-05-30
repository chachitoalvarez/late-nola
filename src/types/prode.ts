export type MatchPhase =
  | 'group_stage'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final'

export type MatchStatus =
  | 'open'
  | 'closing_soon'
  | 'locked'
  | 'live'
  | 'finished'
  | 'points_calculated'
  | 'postponed'
  | 'cancelled'

export interface ProdeMatch {
  id: string
  order: number
  fifaMatchNumber: number
  homeTeamId: string
  awayTeamId: string
  homeTeamName: string
  awayTeamName: string
  homeTeamFlag: string
  awayTeamFlag: string
  homeTeamSlot?: string
  awayTeamSlot?: string
  homeSlotType?: string
  awaySlotType?: string
  homeSlotReference?: string
  awaySlotReference?: string
  phase: MatchPhase
  round: string
  groupName?: string
  groupCode?: string
  groupMatchday?: number
  matchday: string
  startsAt: string
  localDate: string
  localTime: string
  localTimezone: string
  argentinaDate: string
  argentinaTime: string
  stadium: string
  city: string
  hostCountry: string
  status: MatchStatus
  allowsPrediction: boolean
  fixtureNeedsResolution: boolean
  resolvedFromResult: boolean
  winner?: string
  winnerMatchNumber?: number
  loserMatchNumber?: number
  fixtureUpdateNotes?: string
  homeScore?: number
  awayScore?: number
  penaltyHomeScore?: number
  penaltyAwayScore?: number
  qualifiedTeamId?: string
  resultUpdatedAt?: string
  resultUpdatedBy?: string
}

export interface ProdePrediction {
  id: string
  userId: string
  userName: string
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
  predictedQualifiedTeamId?: string
  points: number
  exactScoreHit: boolean
  outcomeHit: boolean
  goalDifferenceHit: boolean
  qualifiedTeamHit: boolean
  createdAt: string
  updatedAt: string
  lockedAt?: string
}

export interface ProdeGroup {
  id: string
  name: string
  avatarUrl?: string
  ownerUserId: string
  inviteCode: string
  createdAt: string
}

export interface ProdeGroupMember {
  id: string
  groupId: string
  userId: string
  userName: string
  joinedAt: string
}

export interface ProdeRankingEntry {
  userId: string
  userName: string
  groupId?: string
  totalPoints: number
  exactHits: number
  outcomeHits: number
  predictionsCount: number
  position: number
}

export interface ResultAuditLog {
  id: string
  matchId: string
  previousResult: Partial<ProdeMatch>
  newResult: Partial<ProdeMatch>
  updatedBy: string
  updatedAt: string
}
