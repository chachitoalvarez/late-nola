import { X, User, RefreshCcw, Trophy } from 'lucide-react'
import type { LeaderboardEntry } from '@/types/user'

interface Props {
  user: LeaderboardEntry
  onClose: () => void
  onProposeSwap: () => void
}

export function PublicProfileDrawer({ user, onClose, onProposeSwap }: Props) {
  const completed = user.completed ?? 0
  const needed = user.needed ?? 0
  const repeated = user.repeated ?? 0
  const percentage = needed > 0 ? Math.round((completed / needed) * 100) : 0

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

        {/* Sección 3 — Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide bg-white">
          {/* TODO: cuando exista una vista o RPC que exponga datos públicos de canje
              (logros desbloqueados, figuritas repetidas), reemplazar este empty state
              por las secciones reales. */}
          <div className="flex flex-col items-center justify-center text-center p-8 h-full text-zinc-400">
            <Trophy className="w-10 h-10 mb-3 text-zinc-300" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-500">Perfil público de coleccionista</p>
            <p className="text-xs mt-1.5 max-w-[240px]">
              Pronto vas a poder ver sus logros y figuritas disponibles para intercambiar.
            </p>
          </div>
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
