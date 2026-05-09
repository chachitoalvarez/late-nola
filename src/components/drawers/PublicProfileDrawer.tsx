import { useEffect, useState, useCallback } from 'react'
import { X, User, RefreshCcw, Trophy, Package, Layers, Lock, AlertCircle } from 'lucide-react'
import { getTradeMatch } from '@/services/trades.service'
import type { LeaderboardEntry } from '@/types/user'
import type { TradeMatch } from '@/types/trade'

interface Props {
  user: LeaderboardEntry
  onClose: () => void
  onProposeSwap: () => void
}

type MatchState =
  | { status: 'loading' }
  | { status: 'not_accessible' }
  | { status: 'error'; message: string }
  | { status: 'ok'; match: TradeMatch }

function sectionAbbr(section: string) {
  return section.slice(0, 3).toUpperCase()
}

function TradeChips({ offer, palette }: { offer: Record<string, Record<string, number>>; palette: 'amber' | 'blue' }) {
  const chips = Object.entries(offer).flatMap(([section, stickers]) =>
    Object.entries(stickers).map(([num, count]) => ({ label: `${sectionAbbr(section)}-${num}`, count }))
  )
  const border = palette === 'amber' ? 'border-amber-200 text-amber-800' : 'border-blue-200 text-blue-800'
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.map(({ label, count }) => (
        <span key={label} className={`bg-white border ${border} text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm`}>
          {label}{count > 1 && <span className="text-[9px] opacity-60 ml-0.5">×{count}</span>}
        </span>
      ))}
    </div>
  )
}

export function PublicProfileDrawer({ user, onClose, onProposeSwap }: Props) {
  const completed = user.completed ?? 0
  const needed = user.needed ?? 0
  const repeated = user.repeated ?? 0
  const percentage = needed > 0 ? Math.round((completed / needed) * 100) : 0

  const [matchState, setMatchState] = useState<MatchState>({ status: 'loading' })

  const loadMatch = useCallback(() => {
    console.log('[PublicProfileDrawer] Fetching match for:', user.id)
    setMatchState({ status: 'loading' })
    getTradeMatch(String(user.id)).then(result => {
      console.log('[PublicProfileDrawer] Got match result:', result)
      if (!result.ok) {
        setMatchState(
          result.reason === 'not_accessible'
            ? { status: 'not_accessible' }
            : { status: 'error', message: result.message }
        )
      } else {
        setMatchState({ status: 'ok', match: result.match })
      }
    })
  }, [user.id])

  useEffect(() => { loadMatch() }, [loadMatch])

  const noMatch = matchState.status === 'ok' &&
    matchState.match.theyOfferCount === 0 && matchState.match.iOfferCount === 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="w-full md:w-[400px] bg-zinc-50 h-[100dvh] shadow-2xl flex flex-col relative z-10 animate-in slide-in-from-right-8 duration-300 rounded-l-[2rem] md:rounded-l-none overflow-hidden">

        {/* Sección 1 — Header compacto */}
        <div className="flex-shrink-0 px-5 py-4 bg-white border-b border-zinc-200/60 flex items-center gap-3 pt-[calc(1rem+env(safe-area-inset-top))]">
          <div className="w-10 h-10 rounded-full bg-zinc-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-zinc-400" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-base font-black text-zinc-900 tracking-tight truncate">
              @{user.name || 'usuario'}
            </p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Coleccionista</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors active:scale-90 flex-shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Sección 2 — Métricas */}
        <div className="flex-shrink-0 bg-zinc-100/60 p-4 border-b border-zinc-200/60">
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: `${percentage}%`, label: 'Avance', color: 'text-amber-600' },
              { value: completed, label: 'Pegadas', color: 'text-emerald-600' },
              { value: needed - completed, label: 'Faltan', color: 'text-blue-600' },
              { value: repeated, label: 'Repes', color: 'text-purple-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-2.5 border border-zinc-200/60 text-center shadow-sm flex flex-col items-center justify-center">
                <p className={`text-xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sección 3 — Cruce de figuritas */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide bg-white">

          {matchState.status === 'loading' && (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-zinc-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {matchState.status === 'not_accessible' && (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full gap-3">
              <Lock className="w-8 h-8 text-zinc-300" strokeWidth={1.5} />
              <p className="text-sm font-medium text-zinc-500 max-w-[260px]">
                Este coleccionista mantiene su perfil privado. Solo es visible si compartís un grupo con él.
              </p>
            </div>
          )}

          {matchState.status === 'error' && (
            <div className="p-5">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red-700">No pudimos cargar las figuritas para intercambiar.</p>
                  <button
                    onClick={loadMatch}
                    className="text-xs font-bold text-red-600 underline mt-1 hover:text-red-800 transition-colors"
                  >
                    Intentá de nuevo
                  </button>
                </div>
              </div>
            </div>
          )}

          {matchState.status === 'ok' && noMatch && (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
              <Trophy className="w-10 h-10 mb-3 text-zinc-300" strokeWidth={1.5} />
              <p className="text-sm font-medium text-zinc-500">No hay cruce de figuritas con este coleccionista por ahora.</p>
            </div>
          )}

          {matchState.status === 'ok' && !noMatch && (
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
                  <span className="text-sm font-black text-amber-900">Te sirven</span>
                  <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {matchState.match.theyOfferCount}
                  </span>
                </div>
                {matchState.match.theyOfferCount > 0
                  ? <TradeChips offer={matchState.match.theyOffer} palette="amber" />
                  : <p className="text-xs text-amber-700/60 mt-2">Nada de lo que tiene te sirve.</p>
                }
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                  <span className="text-sm font-black text-blue-900">Tenés para él</span>
                  <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {matchState.match.iOfferCount}
                  </span>
                </div>
                {matchState.match.iOfferCount > 0
                  ? <TradeChips offer={matchState.match.iOffer} palette="blue" />
                  : <p className="text-xs text-blue-700/60 mt-2">Nada de tus repetidas le sirve.</p>
                }
              </div>
            </div>
          )}
        </div>

        {/* Sección 4 — Footer con CTA */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-zinc-200/60 shadow-[0_-4px_15px_rgba(0,0,0,0.02)] pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            onClick={onProposeSwap}
            className="w-full bg-zinc-900 text-white font-bold py-3 px-4 rounded-2xl hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" strokeWidth={2.5} /> Proponer Intercambio
          </button>
        </div>

      </div>
    </div>
  )
}
