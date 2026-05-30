import rawFixture from './fixture_mundial_2026_completo_hasta_final_argentina.json'
import type { MatchPhase, MatchStatus, ProdeMatch, ProdePrediction } from '@/types/prode'

interface FixtureMatch {
  orden_cronologico: number
  match_number_fifa: number
  fase: string
  ronda: string
  grupo: string
  jornada_grupo: number | ''
  equipo_local: string
  equipo_local_codigo: string
  equipo_local_slot: string
  equipo_visitante: string
  equipo_visitante_codigo: string
  equipo_visitante_slot: string
  slot_local_tipo: string
  slot_local_referencia: string
  slot_visitante_tipo: string
  slot_visitante_referencia: string
  fecha_local: string
  hora_local: string
  timezone_local: string
  fecha_argentina: string
  hora_argentina: string
  datetime_argentina_iso: string
  estadio: string
  ciudad: string
  pais_sede: string
  estado_partido: string
  permite_prediccion: boolean
  fixture_needs_resolution: boolean
  resolved_from_result: boolean
  goles_local: number | ''
  goles_visitante: number | ''
  ganador: string
  ganador_match_number: number | ''
  perdedor_match_number: number | ''
  notas_actualizacion_fixture: string
}

const phaseByRound: Record<string, MatchPhase> = {
  'Fase de grupos': 'group_stage',
  '16avos de final': 'round_of_32',
  'Octavos de final': 'round_of_16',
  'Cuartos de final': 'quarter_final',
  Semifinal: 'semi_final',
  'Tercer puesto': 'third_place',
  Final: 'final',
}

const statusByFixtureStatus: Record<string, MatchStatus> = {
  programado: 'open',
  en_vivo: 'live',
  finalizado: 'finished',
  puntos_calculados: 'points_calculated',
  postergado: 'postponed',
  cancelado: 'cancelled',
}

function toNumber(value: number | ''): number | undefined {
  return value === '' ? undefined : value
}

function getMatchday(match: FixtureMatch): string {
  if (match.ronda !== 'Fase de grupos') return match.ronda
  return match.jornada_grupo ? `Fecha ${match.jornada_grupo}` : 'Fase de grupos'
}

function toProdeMatch(match: FixtureMatch): ProdeMatch {
  const homeTeamId = match.equipo_local_codigo || match.equipo_local_slot || match.slot_local_referencia
  const awayTeamId = match.equipo_visitante_codigo || match.equipo_visitante_slot || match.slot_visitante_referencia

  return {
    id: `m-${match.match_number_fifa}`,
    order: match.orden_cronologico,
    fifaMatchNumber: match.match_number_fifa,
    homeTeamId,
    awayTeamId,
    homeTeamName: match.equipo_local,
    awayTeamName: match.equipo_visitante,
    homeTeamFlag: match.equipo_local_codigo || '',
    awayTeamFlag: match.equipo_visitante_codigo || '',
    homeTeamSlot: match.equipo_local_slot || undefined,
    awayTeamSlot: match.equipo_visitante_slot || undefined,
    homeSlotType: match.slot_local_tipo || undefined,
    awaySlotType: match.slot_visitante_tipo || undefined,
    homeSlotReference: match.slot_local_referencia || undefined,
    awaySlotReference: match.slot_visitante_referencia || undefined,
    phase: phaseByRound[match.ronda] ?? 'group_stage',
    round: match.ronda,
    groupName: match.grupo ? `Grupo ${match.grupo}` : undefined,
    groupCode: match.grupo || undefined,
    groupMatchday: typeof match.jornada_grupo === 'number' ? match.jornada_grupo : undefined,
    matchday: getMatchday(match),
    startsAt: match.datetime_argentina_iso,
    localDate: match.fecha_local,
    localTime: match.hora_local,
    localTimezone: match.timezone_local,
    argentinaDate: match.fecha_argentina,
    argentinaTime: match.hora_argentina,
    stadium: match.estadio,
    city: match.ciudad,
    hostCountry: match.pais_sede,
    status: statusByFixtureStatus[match.estado_partido] ?? 'open',
    allowsPrediction: match.permite_prediccion,
    fixtureNeedsResolution: match.fixture_needs_resolution,
    resolvedFromResult: match.resolved_from_result,
    homeScore: toNumber(match.goles_local),
    awayScore: toNumber(match.goles_visitante),
    winner: match.ganador || undefined,
    winnerMatchNumber: toNumber(match.ganador_match_number),
    loserMatchNumber: toNumber(match.perdedor_match_number),
    fixtureUpdateNotes: match.notas_actualizacion_fixture || undefined,
  }
}

export const PRODE_MATCHES: ProdeMatch[] = (rawFixture as FixtureMatch[])
  .map(toProdeMatch)
  .sort((a, b) => a.order - b.order)

export const PRODE_FRIEND_PREDICTIONS: ProdePrediction[] = []
