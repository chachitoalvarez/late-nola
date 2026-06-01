import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Check, ChevronDown, Clipboard, Globe2, Pencil, Plus, Share2, ShieldCheck, Users } from 'lucide-react'
import { getEffectiveMatchStatus, isMatchEditable } from '@/lib/prode'
import type { MatchStatus, ProdeGroup, ProdeMatch, ProdePrediction, ProdeRankingEntry } from '@/types/prode'

interface Props {
  userId: string
  userName: string
  matches: ProdeMatch[]
  predictions: ProdePrediction[]
  predictionsByMatch: Map<string, ProdePrediction>
  pendingMatches: ProdeMatch[]
  rankingGeneral: ProdeRankingEntry[]
  primaryGroup: ProdeGroup | null
  groupRanking: ProdeRankingEntry[]
  groups: ProdeGroup[]
  canManageResults: boolean
  onSavePredictions: (items: Array<{ matchId: string; homeScore: number; awayScore: number; qualifiedTeamId?: string }>) => number
  onUpdateResult: (matchId: string, patch: Partial<ProdeMatch>) => void
  onCreateGroup: (name: string) => ProdeGroup | null
}

type ProdeSection = 'matches' | 'ranking' | 'grupos' | 'admin'
type PredictionFilter = 'pending' | 'predicted' | 'all'
type MatchPhaseFilter = 'all' | 'group_stage' | 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final'
type MatchFixtureFilter = MatchPhaseFilter | `group_${string}`

const PRODE_TABS: Array<{ id: ProdeSection; label: string }> = [
  { id: 'matches', label: 'Partidos' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'grupos', label: 'Grupos' },
  { id: 'admin', label: 'Admin' },
]

const FIXTURE_PHASE_FILTERS: Array<{ id: MatchFixtureFilter; label: string }> = [
  { id: 'all', label: 'Todas las fases' },
  { id: 'group_stage', label: 'Grupo' },
  { id: 'group_A', label: 'Grupo A' },
  { id: 'group_B', label: 'Grupo B' },
  { id: 'group_C', label: 'Grupo C' },
  { id: 'group_D', label: 'Grupo D' },
  { id: 'group_E', label: 'Grupo E' },
  { id: 'group_F', label: 'Grupo F' },
  { id: 'group_G', label: 'Grupo G' },
  { id: 'group_H', label: 'Grupo H' },
  { id: 'group_I', label: 'Grupo I' },
  { id: 'group_J', label: 'Grupo J' },
  { id: 'group_K', label: 'Grupo K' },
  { id: 'group_L', label: 'Grupo L' },
  { id: 'round_of_32', label: '16vos' },
  { id: 'round_of_16', label: '8vos' },
  { id: 'quarter_final', label: '4tos' },
  { id: 'semi_final', label: 'Semifinales' },
  { id: 'final', label: 'Final' },
]

const STATUS_LABELS: Partial<Record<MatchStatus, string>> = {
  closing_soon: 'Cierra pronto',
  locked: 'Predicción cerrada',
  live: 'En juego',
  finished: 'Finalizado',
  points_calculated: 'Finalizado',
  postponed: 'Postergado',
  cancelled: 'Cancelado',
}

const FIFA_TO_ISO: Record<string, string> = {
  ALG: 'DZ',
  ARG: 'AR',
  AUS: 'AU',
  AUT: 'AT',
  BEL: 'BE',
  BIH: 'BA',
  BRA: 'BR',
  CAN: 'CA',
  CIV: 'CI',
  COD: 'CD',
  COL: 'CO',
  CPV: 'CV',
  CRO: 'HR',
  CUW: 'CW',
  CZE: 'CZ',
  ECU: 'EC',
  EGY: 'EG',
  ENG: 'GB',
  ESP: 'ES',
  FRA: 'FR',
  GER: 'DE',
  GHA: 'GH',
  HAI: 'HT',
  IRN: 'IR',
  IRQ: 'IQ',
  JOR: 'JO',
  JPN: 'JP',
  KOR: 'KR',
  KSA: 'SA',
  MAR: 'MA',
  MEX: 'MX',
  NED: 'NL',
  NOR: 'NO',
  NZL: 'NZ',
  PAN: 'PA',
  PAR: 'PY',
  POR: 'PT',
  QAT: 'QA',
  RSA: 'ZA',
  SCO: 'GB',
  SEN: 'SN',
  SUI: 'CH',
  SWE: 'SE',
  TUN: 'TN',
  TUR: 'TR',
  URU: 'UY',
  USA: 'US',
  UZB: 'UZ',
}

function ProdeTabs({
  activeTab,
  canManageResults,
  onChange,
}: {
  activeTab: ProdeSection
  canManageResults: boolean
  onChange: (tab: ProdeSection) => void
}) {
  const tabs = PRODE_TABS.filter(tab => canManageResults || tab.id !== 'admin')

  return (
    <div className="-mx-1 overflow-x-auto border-b border-zinc-100 px-1 pb-1">
      <div className="flex min-w-max items-end gap-1.5 lg:gap-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`rounded-t-xl border-b-2 px-3 py-2 text-xs font-bold transition-all lg:text-sm ${
                isActive
                  ? 'border-amber-500 bg-amber-50/40 text-amber-600'
                  : 'border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function parseScore(value: string): number | '' | null {
  if (value.trim() === '') return ''
  if (!/^\d+$/.test(value)) return null
  const numeric = Number(value)
  return Number.isSafeInteger(numeric) && numeric >= 0 ? numeric : null
}

function ScoreInput({
  value,
  onChange,
  disabled,
  inputRef,
  onComplete,
  ariaLabel,
}: {
  value: number | ''
  onChange: (value: number | '') => void
  disabled?: boolean
  inputRef?: RefObject<HTMLInputElement | null>
  onComplete?: () => void
  ariaLabel: string
}) {
  return (
    <input
      ref={inputRef}
      aria-label={ariaLabel}
      value={value}
      disabled={disabled}
      inputMode="numeric"
      pattern="[0-9]*"
      placeholder="-"
      onChange={event => {
        const next = parseScore(event.target.value)
        if (next === null) return
        onChange(next)
        if (next !== '') onComplete?.()
      }}
      className="h-10 w-10 shrink-0 rounded-xl border border-zinc-200 bg-white text-center text-base font-black text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 disabled:bg-zinc-100 disabled:text-zinc-400 md:h-11 md:w-12"
    />
  )
}

function countryFlag(code: string): string {
  if (!code) return ''
  const iso = FIFA_TO_ISO[code] ?? code
  if (!/^[A-Z]{2}$/.test(iso)) return ''
  return [...iso].map(char => String.fromCodePoint(127397 + char.charCodeAt(0))).join('')
}

function formatSectionDate(match: ProdeMatch): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(match.startsAt))
}

function formatMatchHour(match: ProdeMatch): string {
  return match.argentinaTime || new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(match.startsAt))
}

function matchRoundLabel(match: ProdeMatch): string {
  return match.groupName ?? match.round
}

function predictionStatusLabel(match: ProdeMatch, prediction?: ProdePrediction): string {
  const status = getEffectiveMatchStatus(match)
  if (status === 'live') return 'En juego'
  if (status === 'finished' || status === 'points_calculated') return 'Finalizado'
  if (status === 'locked') return 'Predicción cerrada'
  if (status === 'postponed' || status === 'cancelled') return STATUS_LABELS[status] ?? ''
  return prediction ? 'Guardado' : 'Pendiente'
}

function TeamName({ name, flag, align = 'left' }: { name: string; flag: string; align?: 'left' | 'right' }) {
  return (
    <div className={`flex min-w-0 items-center gap-1.5 ${align === 'right' ? 'justify-end text-right' : ''}`}>
      {align === 'left' && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[1.25rem] leading-none" aria-hidden="true">
          {flag}
        </span>
      )}
      <span className="min-w-0 overflow-hidden text-[0.8rem] font-black leading-[1.12] text-zinc-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [overflow-wrap:normal] [text-wrap:balance] md:text-sm">
        {name}
      </span>
      {align === 'right' && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[1.25rem] leading-none" aria-hidden="true">
          {flag}
        </span>
      )}
    </div>
  )
}

function MatchPredictionCard({
  match,
  prediction,
  draft,
  setDraft,
  onSave,
}: {
  match: ProdeMatch
  prediction?: ProdePrediction
  draft?: { home: number | ''; away: number | '' }
  setDraft: (draft: { home: number | ''; away: number | '' }) => void
  onSave: (match: ProdeMatch, draft: { home: number | ''; away: number | '' }, wasEditing: boolean) => void
}) {
  const homeInputRef = useRef<HTMLInputElement>(null)
  const awayInputRef = useRef<HTMLInputElement>(null)
  const editable = isMatchEditable(match)
  const officialResult = match.homeScore !== undefined && match.awayScore !== undefined
  const value = draft ?? {
    home: prediction?.predictedHomeScore ?? '',
    away: prediction?.predictedAwayScore ?? '',
  }
  const label = predictionStatusLabel(match, prediction)
  const status = getEffectiveMatchStatus(match)
  const isFinished = status === 'finished' || status === 'points_calculated'

  const updateDraft = (side: 'home' | 'away', nextValue: number | '') => {
    const nextDraft = { ...value, [side]: nextValue }
    setDraft(nextDraft)
    if (!editable || nextDraft.home === '' || nextDraft.away === '') return
    if (prediction && prediction.predictedHomeScore === nextDraft.home && prediction.predictedAwayScore === nextDraft.away) return
    onSave(match, nextDraft, !!prediction)
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-amber-200 md:p-4">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <p className="truncate text-xs font-black uppercase tracking-wider text-zinc-500">{matchRoundLabel(match)}</p>
        <p className="shrink-0 text-xs font-black text-zinc-500">{formatMatchHour(match)}</p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)] items-center gap-2 md:grid-cols-[minmax(0,1fr)_8rem_minmax(0,1fr)]">
        <TeamName name={match.homeTeamName} flag={countryFlag(match.homeTeamFlag)} />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
          <ScoreInput
            ariaLabel={`Goles de ${match.homeTeamName}`}
            value={officialResult ? match.homeScore ?? '' : value.home}
            disabled={!editable}
            inputRef={homeInputRef}
            onComplete={() => awayInputRef.current?.focus()}
            onChange={home => updateDraft('home', home)}
          />
          <span className="text-[0.65rem] font-black uppercase text-zinc-400">vs</span>
          <ScoreInput
            ariaLabel={`Goles de ${match.awayTeamName}`}
            value={officialResult ? match.awayScore ?? '' : value.away}
            disabled={!editable}
            inputRef={awayInputRef}
            onChange={away => updateDraft('away', away)}
          />
        </div>
        <TeamName name={match.awayTeamName} flag={countryFlag(match.awayTeamFlag)} align="right" />
      </div>

      <div className="mt-2.5 flex min-h-5 items-center justify-between gap-3">
        <p className={`text-xs font-black ${label === 'Guardado' ? 'text-emerald-600' : isFinished ? 'text-amber-600' : editable ? 'text-zinc-500' : 'text-zinc-500'}`}>
          {label}
          {isFinished && prediction ? ` · ${prediction.points} pts` : ''}
        </p>
        {prediction && editable && !officialResult && (
          <button
            type="button"
            aria-label="Editar predicción"
            onClick={() => homeInputRef.current?.focus()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition hover:bg-amber-100"
          >
            <Pencil className="h-4 w-4" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </article>
  )
}

function RankingRows({ rows }: { rows: ProdeRankingEntry[] }) {
  if (rows.every(row => row.predictionsCount === 0)) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center">
        <p className="text-sm font-bold text-zinc-700">El ranking se va a armar cuando se calculen los primeros partidos.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
      {rows.map(row => (
        <div key={row.userId} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0">
          <div className="text-sm font-black text-amber-600">#{row.position}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-zinc-900">@{row.userName}</p>
            <p className="text-xs font-semibold text-zinc-500">{row.exactHits} exactos · {row.outcomeHits} aciertos · {row.predictionsCount} predicciones</p>
          </div>
          <div className="text-right text-lg font-black text-zinc-900">{row.totalPoints} pts</div>
        </div>
      ))}
    </div>
  )
}

export function ProdeView({
  userId,
  matches,
  predictionsByMatch,
  pendingMatches,
  rankingGeneral,
  primaryGroup,
  groupRanking,
  groups,
  canManageResults,
  onSavePredictions,
  onUpdateResult,
  onCreateGroup,
}: Props) {
  const [section, setSection] = useState<ProdeSection>('matches')
  const [predictionFilter, setPredictionFilter] = useState<PredictionFilter>('pending')
  const [phaseFilter, setPhaseFilter] = useState<MatchFixtureFilter>('all')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [drafts, setDrafts] = useState<Record<string, { home: number | ''; away: number | '' }>>({})
  const [groupName, setGroupName] = useState('')
  const [rankingGroupFilter, setRankingGroupFilter] = useState('all')
  const [lastCreatedGroup, setLastCreatedGroup] = useState<ProdeGroup | null>(null)
  const [adminDraft, setAdminDraft] = useState<{ matchId: string; home: number | ''; away: number | ''; qualifiedTeamId: string }>({
    matchId: matches[0]?.id ?? '',
    home: '',
    away: '',
    qualifiedTeamId: '',
  })

  useEffect(() => {
    if (section === 'admin' && !canManageResults) {
      setSection('matches')
    }
  }, [canManageResults, section])

  useEffect(() => {
    if (!feedbackMessage) return
    const timeout = window.setTimeout(() => setFeedbackMessage(''), 1800)
    return () => window.clearTimeout(timeout)
  }, [feedbackMessage])

  const currentUserRanking = rankingGeneral.find(row => row.userId === userId)
  const currentGroupRanking = groupRanking.find(row => row.userId === userId)
  const selectedRankingGroup = groups.find(group => group.id === rankingGroupFilter) ?? null
  const visibleRanking = rankingGroupFilter === 'all' ? rankingGeneral : groupRanking

  const phaseMatches = useMemo(() => {
    return matches.filter(match => {
      if (phaseFilter.startsWith('group_')) return match.groupCode === phaseFilter.replace('group_', '')
      if (phaseFilter !== 'all' && match.phase !== phaseFilter) return false
      return true
    })
  }, [matches, phaseFilter])

  const filterCounts = useMemo(() => {
    const pending = phaseMatches.filter(match => isMatchEditable(match) && !predictionsByMatch.has(match.id)).length
    const predicted = phaseMatches.filter(match => predictionsByMatch.has(match.id)).length
    return { pending, predicted, all: phaseMatches.length }
  }, [phaseMatches, predictionsByMatch])

  const filteredMatches = useMemo(() => {
    return phaseMatches.filter(match => {
      const hasPrediction = predictionsByMatch.has(match.id)
      if (predictionFilter === 'pending') return isMatchEditable(match) && !hasPrediction
      if (predictionFilter === 'predicted') return hasPrediction
      return true
    })
  }, [phaseMatches, predictionFilter, predictionsByMatch])

  const groupedMatches = useMemo(() => {
    const groupsByDate = new Map<string, { title: string; matches: ProdeMatch[] }>()
    for (const match of filteredMatches) {
      const key = match.argentinaDate || match.startsAt.slice(0, 10)
      const group = groupsByDate.get(key) ?? { title: formatSectionDate(match), matches: [] }
      group.matches.push(match)
      groupsByDate.set(key, group)
    }
    return [...groupsByDate.values()]
  }, [filteredMatches])

  const saveInlinePrediction = (match: ProdeMatch, draft: { home: number | ''; away: number | '' }, wasEditing: boolean) => {
    if (draft.home === '' || draft.away === '') return
    const savedCount = onSavePredictions([{ matchId: match.id, homeScore: draft.home, awayScore: draft.away }])
    if (savedCount <= 0) {
      setFeedbackMessage('No pudimos guardar la predicción. Intentá de nuevo.')
      return
    }
    setFeedbackMessage(wasEditing ? 'Predicción actualizada' : 'Predicción guardada')
  }

  const createGroup = () => {
    const group = onCreateGroup(groupName)
    if (!group) return
    setLastCreatedGroup(group)
    setGroupName('')
  }

  const predictionFilters: Array<{ id: PredictionFilter; label: string; count: number }> = [
    { id: 'pending', label: 'Pendientes', count: filterCounts.pending },
    { id: 'predicted', label: 'Predichos', count: filterCounts.predicted },
    { id: 'all', label: 'Todos', count: filterCounts.all },
  ]

  return (
    <div className="animate-in slide-in-from-right-4 space-y-4 duration-300 md:space-y-5">
      {feedbackMessage && (
        <div className="fixed left-1/2 top-[calc(0.75rem+env(safe-area-inset-top))] z-[70] flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-lg">
          <Check className="h-4 w-4" strokeWidth={2.5} />
          {feedbackMessage}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-zinc-900 md:text-2xl">Prode Late Nola</h2>
          <p className="text-xs font-bold text-zinc-500 md:text-sm">
            {pendingMatches.length} predicciones pendientes
          </p>
        </div>
        <div className="hidden rounded-2xl bg-amber-50 px-3 py-2 text-right md:block">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">General</p>
          <p className="text-lg font-black text-zinc-900">#{currentUserRanking?.position ?? '-'}</p>
        </div>
      </div>

      <ProdeTabs activeTab={section} canManageResults={canManageResults} onChange={setSection} />

      {section === 'matches' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {predictionFilters.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPredictionFilter(item.id)}
                  className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-black transition ${
                    predictionFilter === item.id
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'border border-zinc-200 bg-white text-zinc-600'
                  }`}
                >
                  {item.label} <span className="opacity-80">{item.count}</span>
                </button>
              ))}
            </div>

            <div className="relative w-full md:max-w-xs">
              <select
                value={phaseFilter}
                onChange={event => setPhaseFilter(event.target.value as MatchFixtureFilter)}
                className="h-11 w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 pr-10 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20"
              >
                {FIXTURE_PHASE_FILTERS.map(item => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" strokeWidth={2.5} />
            </div>
          </div>

          {groupedMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-center">
              <p className="text-sm font-black text-zinc-800">No hay partidos para este filtro.</p>
              <p className="mt-1 text-sm font-semibold text-zinc-500">Probá con Predichos o Todos.</p>
            </div>
          ) : groupedMatches.map(group => (
            <section key={group.title} className="space-y-2">
              <h3 className="px-1 text-sm font-black text-zinc-500">{group.title}</h3>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {group.matches.map(match => (
                  <MatchPredictionCard
                    key={match.id}
                    match={match}
                    prediction={predictionsByMatch.get(match.id)}
                    draft={drafts[match.id]}
                    setDraft={draft => setDrafts(prev => ({ ...prev, [match.id]: draft }))}
                    onSave={saveInlinePrediction}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {section === 'ranking' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:max-w-lg">
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Grupo</p>
              <p className="mt-1 text-2xl font-black text-zinc-900">#{currentGroupRanking?.position ?? '-'}</p>
              <p className="text-xs font-semibold text-zinc-500">{primaryGroup?.name ?? 'Sin grupo'}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">General</p>
              <p className="mt-1 text-2xl font-black text-zinc-900">#{currentUserRanking?.position ?? '-'}</p>
              <p className="text-xs font-semibold text-zinc-500">{currentUserRanking?.totalPoints ?? 0} pts</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200/60 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" strokeWidth={2.5} />
              <select
                value={rankingGroupFilter}
                onChange={event => setRankingGroupFilter(event.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-11 text-sm font-semibold text-zinc-900 transition-all focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 md:h-11"
              >
                <option value="all">Todos (Global)</option>
                {groups.length > 0 && (
                  <optgroup label="Tus grupos">
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" strokeWidth={2.5} />
            </div>

            <button
              type="button"
              onClick={() => setSection('grupos')}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 text-sm font-black text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-lg md:w-auto"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              Crear grupo
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-black text-zinc-900">
              {selectedRankingGroup ? `Ranking de ${selectedRankingGroup.name}` : 'Ranking general'}
            </h3>
            <RankingRows rows={visibleRanking} />
          </div>
        </div>
      )}

      {section === 'grupos' && (
        <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-black text-zinc-900">Crear grupo</h3>
            </div>
            <input
              value={groupName}
              onChange={event => setGroupName(event.target.value)}
              placeholder="Los gorditos del Mundial"
              className="mt-4 h-12 w-full rounded-2xl border border-zinc-200 px-4 text-sm font-bold outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20"
            />
            <button onClick={createGroup} className="mt-3 h-12 w-full rounded-2xl bg-amber-500 font-black text-white shadow-md">
              Crear grupo
            </button>
            {lastCreatedGroup && (
              <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                <p className="text-sm font-black text-zinc-900">Grupo creado</p>
                <p className="mt-1 text-xs font-semibold text-zinc-600">Compartí el código {lastCreatedGroup.inviteCode} con tus amigos.</p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Sumate a mi grupo de Prode Late Nola: ${window.location.origin}/prode?grupo=${lastCreatedGroup.inviteCode}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white"
                  >
                    <Share2 className="h-4 w-4" /> WhatsApp
                  </a>
                  <button
                    onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/prode?grupo=${lastCreatedGroup.inviteCode}`)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-zinc-700"
                  >
                    <Clipboard className="h-4 w-4" /> Copiar link
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-zinc-900">Tus grupos</h3>
            <div className="mt-3 space-y-3">
              {groups.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center text-sm font-bold text-zinc-500">Creá un grupo para competir con tus amigos durante el Mundial.</p>
              ) : groups.map(group => (
                <div key={group.id} className="rounded-2xl bg-zinc-50 p-4">
                  <p className="font-black text-zinc-900">{group.name}</p>
                  <p className="text-xs font-semibold text-zinc-500">Código de invitación: {group.inviteCode}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'admin' && canManageResults && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-black text-zinc-900">Admin de resultados</h3>
          </div>
          <p className="mt-1 text-sm font-semibold text-zinc-500">Cargá resultados manualmente y recalculá puntos.</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <select
              value={adminDraft.matchId}
              onChange={event => setAdminDraft(prev => ({ ...prev, matchId: event.target.value }))}
              className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold"
            >
              {matches.map(match => <option key={match.id} value={match.id}>{match.homeTeamName} vs {match.awayTeamName}</option>)}
            </select>
            <ScoreInput ariaLabel="Goles local" value={adminDraft.home} onChange={home => setAdminDraft(prev => ({ ...prev, home }))} />
            <ScoreInput ariaLabel="Goles visitante" value={adminDraft.away} onChange={away => setAdminDraft(prev => ({ ...prev, away }))} />
            <button
              onClick={() => {
                if (adminDraft.home === '' || adminDraft.away === '') return
                const match = matches.find(item => item.id === adminDraft.matchId)
                if (!match) return
                if (!window.confirm(`Vas a finalizar ${match.homeTeamName} vs ${match.awayTeamName} con resultado ${adminDraft.home}-${adminDraft.away}. Esto recalculará puntos y rankings. ¿Confirmar?`)) return
                onUpdateResult(adminDraft.matchId, {
                  homeScore: adminDraft.home,
                  awayScore: adminDraft.away,
                  qualifiedTeamId: adminDraft.qualifiedTeamId || undefined,
                  status: 'points_calculated',
                })
              }}
              className="h-12 rounded-2xl bg-amber-500 px-5 text-sm font-black text-white shadow-md"
            >
              Finalizar partido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
