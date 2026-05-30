import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, Clipboard, Clock, Globe2, Plus, Share2, ShieldCheck, Trophy, Users } from 'lucide-react'
import { PRODE_FRIEND_PREDICTIONS } from '@/data/prodeData'
import { calculatePredictionPoints, formatMatchTime, formatTimeToClose, getEffectiveMatchStatus, isMatchEditable } from '@/lib/prode'
import type { ProdeGroup, ProdeMatch, ProdePrediction, ProdeRankingEntry } from '@/types/prode'

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
  onSavePredictions: (items: Array<{ matchId: string; homeScore: number; awayScore: number; qualifiedTeamId?: string }>) => void
  onUpdateResult: (matchId: string, patch: Partial<ProdeMatch>) => void
  onCreateGroup: (name: string) => ProdeGroup | null
}

type ProdeSection = 'home' | 'fixture' | 'ranking' | 'grupos' | 'admin'
type MatchFilter = 'all' | 'today' | 'upcoming' | 'pending' | 'finished'

const PRODE_TABS: Array<{ id: ProdeSection; label: string }> = [
  { id: 'home', label: 'Inicio' },
  { id: 'fixture', label: 'Fixture' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'grupos', label: 'Grupos' },
  { id: 'admin', label: 'Admin' },
]

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  closing_soon: 'Cierra pronto',
  locked: 'Cerrado',
  live: 'En vivo',
  finished: 'Finalizado',
  points_calculated: 'Puntos calculados',
  postponed: 'Postergado',
  cancelled: 'Cancelado',
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

function scoreValue(value: string): number | null {
  if (value.trim() === '') return null
  const numeric = Number(value)
  return Number.isInteger(numeric) && numeric >= 0 ? numeric : null
}

function MatchScoreInput({ value, onChange, disabled }: { value: number | ''; onChange: (value: number | '') => void; disabled?: boolean }) {
  return (
    <input
      value={value}
      disabled={disabled}
      inputMode="numeric"
      pattern="[0-9]*"
      onChange={event => {
        const next = scoreValue(event.target.value)
        onChange(next ?? '')
      }}
      className="h-10 w-12 rounded-xl border border-zinc-200 bg-white text-center text-base font-black text-zinc-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 disabled:bg-zinc-100 disabled:text-zinc-400"
    />
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

function MatchCard({
  match,
  prediction,
  onOpen,
  compact = false,
}: {
  match: ProdeMatch
  prediction?: ProdePrediction
  onOpen: () => void
  compact?: boolean
}) {
  const status = getEffectiveMatchStatus(match)
  const editable = isMatchEditable(match)
  const officialResult = match.homeScore !== undefined && match.awayScore !== undefined
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full rounded-3xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-200 hover:shadow-md ${compact ? 'space-y-2' : 'space-y-3'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{match.matchday} · {match.groupName ?? 'Eliminatorias'}</p>
          <h3 className="mt-1 truncate text-base font-black text-zinc-900">
            {match.homeTeamName} vs {match.awayTeamName}
          </h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${status === 'closing_soon' ? 'bg-red-50 text-red-600' : editable ? 'bg-amber-50 text-amber-700' : 'bg-zinc-100 text-zinc-500'}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500">
        <Clock className="h-4 w-4" />
        <span>{formatMatchTime(match.startsAt)}</span>
        {editable && <span className="text-amber-600">{formatTimeToClose(match.startsAt)}</span>}
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2">
        <div className="text-xs font-bold text-zinc-500">
          {officialResult ? 'Resultado oficial' : prediction ? 'Tu predicción' : 'Sin predicción'}
        </div>
        <div className="text-sm font-black text-zinc-900">
          {officialResult
            ? `${match.homeScore} - ${match.awayScore}`
            : prediction
              ? `${prediction.predictedHomeScore} - ${prediction.predictedAwayScore}`
              : 'Predecir'}
        </div>
      </div>
      {prediction && officialResult && (
        <p className="text-sm font-black text-amber-600">Sumaste {prediction.points} pts</p>
      )}
    </button>
  )
}

export function ProdeView({
  userId,
  matches,
  predictions,
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
  const [section, setSection] = useState<ProdeSection>('home')
  const [filter, setFilter] = useState<MatchFilter>('all')
  const [selectedMatch, setSelectedMatch] = useState<ProdeMatch | null>(null)
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
      setSection('home')
    }
  }, [canManageResults, section])

  const currentUserRanking = rankingGeneral.find(row => row.userId === userId)
  const currentGroupRanking = groupRanking.find(row => row.userId === userId)
  const selectedRankingGroup = groups.find(group => group.id === rankingGroupFilter) ?? null
  const visibleRanking = rankingGroupFilter === 'all' ? rankingGeneral : groupRanking
  const nextMatch = [...matches]
    .filter(match => isMatchEditable(match))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const status = getEffectiveMatchStatus(match)
      if (filter === 'pending') return !predictionsByMatch.has(match.id) && ['open', 'closing_soon'].includes(status)
      if (filter === 'upcoming') return ['open', 'closing_soon'].includes(status)
      if (filter === 'finished') return ['finished', 'points_calculated'].includes(status)
      if (filter === 'today') return new Date(match.startsAt).toDateString() === new Date().toDateString()
      return true
    })
  }, [filter, matches, predictionsByMatch])

  const groupedMatches = useMemo(() => {
    const groups = new Map<string, ProdeMatch[]>()
    for (const match of filteredMatches) {
      const key = match.matchday
      groups.set(key, [...(groups.get(key) ?? []), match])
    }
    return [...groups.entries()]
  }, [filteredMatches])

  const saveQuickPredictions = () => {
    const items = Object.entries(drafts)
      .map(([matchId, draft]) => draft.home !== '' && draft.away !== '' ? { matchId, homeScore: draft.home, awayScore: draft.away } : null)
      .filter((item): item is { matchId: string; homeScore: number; awayScore: number } => item !== null)
    onSavePredictions(items)
    setDrafts({})
  }

  const createGroup = () => {
    const group = onCreateGroup(groupName)
    if (!group) return
    setLastCreatedGroup(group)
    setGroupName('')
  }

  const selectedPrediction = selectedMatch ? predictionsByMatch.get(selectedMatch.id) : null
  const selectedScoring = selectedMatch && selectedPrediction ? calculatePredictionPoints(selectedMatch, selectedPrediction) : null
  const selectedStatus = selectedMatch ? getEffectiveMatchStatus(selectedMatch) : null
  const revealFriends = selectedStatus ? !['open', 'closing_soon'].includes(selectedStatus) : false

  return (
    <div className="animate-in slide-in-from-right-4 space-y-5 duration-300">
      <ProdeTabs activeTab={section} canManageResults={canManageResults} onChange={setSection} />

      {section === 'home' && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-4">
            {nextMatch && (
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600">
                  <CalendarDays className="h-4 w-4" />
                  Próximo partido que cierra
                </div>
                <MatchCard match={nextMatch} prediction={predictionsByMatch.get(nextMatch.id)} onOpen={() => setSelectedMatch(nextMatch)} compact />
              </div>
            )}

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-zinc-900">Carga rápida</h3>
                  <p className="text-sm font-semibold text-zinc-500">
                    Te faltan {pendingMatches.length} predicciones para completar los partidos disponibles.
                  </p>
                </div>
                <button
                  onClick={saveQuickPredictions}
                  disabled={!Object.values(drafts).some(d => d.home !== '' && d.away !== '')}
                  className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-black text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Guardar predicciones
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {pendingMatches.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 p-5 text-center text-sm font-bold text-zinc-500">
                    Ya cargaste todas las predicciones disponibles por ahora.
                  </div>
                ) : pendingMatches.slice(0, 4).map(match => (
                  <div key={match.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-zinc-50 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-zinc-900">{match.homeTeamName} vs {match.awayTeamName}</p>
                      <p className="text-xs font-semibold text-zinc-500">{formatTimeToClose(match.startsAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MatchScoreInput value={drafts[match.id]?.home ?? ''} onChange={home => setDrafts(prev => ({ ...prev, [match.id]: { home, away: prev[match.id]?.away ?? '' } }))} />
                      <span className="font-black text-zinc-400">-</span>
                      <MatchScoreInput value={drafts[match.id]?.away ?? ''} onChange={away => setDrafts(prev => ({ ...prev, [match.id]: { home: prev[match.id]?.home ?? '', away } }))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-zinc-900">
                <Trophy className="h-5 w-5 text-amber-500" />
                Tu posición
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Grupo</p>
                  <p className="mt-1 text-2xl font-black text-zinc-900">#{currentGroupRanking?.position ?? '-'}</p>
                  <p className="text-xs font-semibold text-zinc-500">{primaryGroup?.name ?? 'Sin grupo'}</p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">General</p>
                  <p className="mt-1 text-2xl font-black text-zinc-900">#{currentUserRanking?.position ?? '-'}</p>
                  <p className="text-xs font-semibold text-zinc-500">{currentUserRanking?.totalPoints ?? 0} pts</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-zinc-900">Actividad reciente</h3>
              <div className="mt-3 space-y-3">
                <p className="rounded-2xl bg-zinc-50 p-3 text-sm font-semibold text-zinc-600">Pili acertó marcador exacto y sumó 5 pts.</p>
                <p className="rounded-2xl bg-zinc-50 p-3 text-sm font-semibold text-zinc-600">Chacho cargó sus predicciones de la Fecha 1.</p>
                <p className="rounded-2xl bg-zinc-50 p-3 text-sm font-semibold text-zinc-600">
                  {primaryGroup ? `Estás ${currentGroupRanking?.position ?? '-'}° en ${primaryGroup.name}.` : 'Creá un grupo para competir con tus amigos durante el Mundial.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {section === 'fixture' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'today', 'upcoming', 'pending', 'finished'] as MatchFilter[]).map(item => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-2xl px-4 py-2 text-sm font-black ${filter === item ? 'bg-amber-500 text-white' : 'bg-white text-zinc-600 border border-zinc-200'}`}
              >
                {item === 'all' ? 'Todos' : item === 'today' ? 'Hoy' : item === 'upcoming' ? 'Próximos' : item === 'pending' ? 'Pendientes' : 'Finalizados'}
              </button>
            ))}
          </div>
          {groupedMatches.map(([title, items]) => (
            <section key={title} className="space-y-3">
              <h3 className="px-1 text-sm font-black uppercase tracking-wider text-zinc-500">{title}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map(match => (
                  <MatchCard key={match.id} match={match} prediction={predictionsByMatch.get(match.id)} onOpen={() => setSelectedMatch(match)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {section === 'ranking' && (
        <div className="space-y-4">
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
            <MatchScoreInput value={adminDraft.home} onChange={home => setAdminDraft(prev => ({ ...prev, home }))} />
            <MatchScoreInput value={adminDraft.away} onChange={away => setAdminDraft(prev => ({ ...prev, away }))} />
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

      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 md:items-center md:p-6" onClick={() => setSelectedMatch(null)}>
          <div className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl md:rounded-[2rem]" onClick={event => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-600">{selectedMatch.matchday}</p>
                <h3 className="mt-1 text-2xl font-black text-zinc-900">{selectedMatch.homeTeamName} vs {selectedMatch.awayTeamName}</h3>
                <p className="mt-1 text-sm font-semibold text-zinc-500">{formatMatchTime(selectedMatch.startsAt)} · {STATUS_LABELS[getEffectiveMatchStatus(selectedMatch)]}</p>
              </div>
              <button onClick={() => setSelectedMatch(null)} className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-black text-zinc-600">Cerrar</button>
            </div>

            <div className="mt-5 rounded-3xl bg-zinc-50 p-4">
              <p className="text-sm font-black text-zinc-900">Tu predicción</p>
              {selectedPrediction ? (
                <p className="mt-2 text-2xl font-black text-zinc-900">{selectedPrediction.predictedHomeScore} - {selectedPrediction.predictedAwayScore}</p>
              ) : (
                <p className="mt-2 text-sm font-semibold text-zinc-500">Todavía no cargaste predicción para este partido.</p>
              )}
              {isMatchEditable(selectedMatch) ? (
                <div className="mt-4 flex items-center gap-2">
                  <MatchScoreInput value={drafts[selectedMatch.id]?.home ?? selectedPrediction?.predictedHomeScore ?? ''} onChange={home => setDrafts(prev => ({ ...prev, [selectedMatch.id]: { home, away: prev[selectedMatch.id]?.away ?? selectedPrediction?.predictedAwayScore ?? '' } }))} />
                  <span className="font-black text-zinc-400">-</span>
                  <MatchScoreInput value={drafts[selectedMatch.id]?.away ?? selectedPrediction?.predictedAwayScore ?? ''} onChange={away => setDrafts(prev => ({ ...prev, [selectedMatch.id]: { home: prev[selectedMatch.id]?.home ?? selectedPrediction?.predictedHomeScore ?? '', away } }))} />
                  <button
                    onClick={() => {
                      const draft = drafts[selectedMatch.id]
                      if (!draft || draft.home === '' || draft.away === '') return
                      onSavePredictions([{ matchId: selectedMatch.id, homeScore: draft.home, awayScore: draft.away }])
                      setDrafts(prev => ({ ...prev, [selectedMatch.id]: { home: '', away: '' } }))
                    }}
                    className="ml-auto rounded-2xl bg-amber-500 px-4 py-2 text-sm font-black text-white"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm font-bold text-zinc-500">Ya no se puede editar.</p>
              )}
            </div>

            {selectedMatch.homeScore !== undefined && selectedMatch.awayScore !== undefined && (
              <div className="mt-4 rounded-3xl bg-amber-50 p-4">
                <p className="text-sm font-black text-zinc-900">Resultado oficial: {selectedMatch.homeScore} - {selectedMatch.awayScore}</p>
                {selectedScoring && <p className="mt-1 text-sm font-semibold text-amber-700">{selectedScoring.explanation}</p>}
              </div>
            )}

            <div className="mt-5">
              <h4 className="text-sm font-black uppercase tracking-wider text-zinc-500">Predicciones de amigos</h4>
              {!revealFriends ? (
                <p className="mt-2 rounded-2xl bg-zinc-50 p-4 text-sm font-semibold text-zinc-600">
                  Tus amigos ya cargaron sus predicciones. Se revelan cuando cierre el partido.
                </p>
              ) : (
                <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-200">
                  {[...PRODE_FRIEND_PREDICTIONS, ...predictions].filter(p => p.matchId === selectedMatch.id).map(prediction => (
                    <div key={prediction.id} className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-zinc-100 px-4 py-3 text-sm last:border-b-0">
                      <span className="font-bold text-zinc-900">{prediction.userName}</span>
                      <span className="font-black text-zinc-700">{prediction.predictedHomeScore} - {prediction.predictedAwayScore}</span>
                      <span className="font-black text-amber-600">{prediction.points} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
