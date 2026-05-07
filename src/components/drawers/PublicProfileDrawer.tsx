import { X, User, RefreshCcw } from 'lucide-react'
import type { LeaderboardEntry } from '@/types/user'

interface Props {
  user: LeaderboardEntry
  onClose: () => void
  onProposeSwap: () => void
}

export function PublicProfileDrawer({ user, onClose, onProposeSwap }: Props) {
  const percentage = Math.round((user.completed / user.needed) * 100)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="w-full md:w-[400px] bg-zinc-50 h-[100dvh] shadow-2xl flex flex-col relative z-10 animate-in slide-in-from-right-8 duration-300 rounded-l-[2rem] md:rounded-l-none overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200/60 flex justify-between items-center bg-white z-20 pt-[calc(1rem+env(safe-area-inset-top))]">
          <h2 className="font-black text-xl text-zinc-900 flex items-center gap-2 tracking-tight">
            <User className="w-5 h-5 text-zinc-400" strokeWidth={2.5} /> Perfil de Coleccionista
          </h2>
          <button onClick={onClose} className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors active:scale-90">
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          <div className="p-8 flex flex-col items-center border-b border-zinc-200/60 bg-white">
            <div className="w-28 h-28 rounded-full bg-zinc-100 border-4 border-white shadow-lg flex items-center justify-center relative mb-5">
              <User className="w-12 h-12 text-zinc-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{user.name}</h3>
          </div>

          <div className="p-6 border-b border-zinc-200/60 bg-zinc-50/50">
            <h3 className="font-black text-zinc-800 mb-4 tracking-tight">Rendimiento</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: `${percentage}%`, label: 'Completado', color: 'text-amber-600' },
                { value: user.completed, label: 'Pegadas', color: 'text-emerald-600' },
                { value: user.needed - user.completed, label: 'Faltantes', color: 'text-blue-600' },
                { value: user.repeated, label: 'Repetidas', color: 'text-purple-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-4 rounded-2xl border border-zinc-200/60 text-center shadow-sm">
                  <p className={`text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <button
              onClick={onProposeSwap}
              className="w-full bg-zinc-900 text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" strokeWidth={2.5} /> Proponer Intercambio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
