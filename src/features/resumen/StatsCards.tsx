import { CircleGauge, Layers, LayoutGrid, Package } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { AlbumStats } from '@/types/album'

const CARD_CLASS = 'bg-white rounded-3xl p-5 lg:p-3.5 shadow-sm border border-zinc-200/60 flex flex-col lg:flex-row items-center lg:items-center gap-4 lg:gap-3 text-center lg:text-left hover:shadow-md transition-shadow lg:h-[84px]'

export function StatsCards({ stats }: { stats: AlbumStats }) {
  const completionLabel = stats.percentage >= 100 ? 'Álbum completo' : `Faltan ${stats.missing}`

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-3.5">
      <div className={CARD_CLASS}>
        <div className="p-3 lg:p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
          <LayoutGrid className="h-6 w-6 lg:h-5 lg:w-5" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Total</p>
          <p className="text-2xl lg:text-xl font-black text-zinc-900 tracking-tight">{stats.totalNeeded}</p>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="p-3 lg:p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
          <Package className="h-6 w-6 lg:h-5 lg:w-5" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Pegadas</p>
          <p className="text-2xl lg:text-xl font-black text-zinc-900 tracking-tight">{stats.totalCompleted}</p>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="p-3 lg:p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
          <Layers className="h-6 w-6 lg:h-5 lg:w-5" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Repetidas</p>
          <p className="text-2xl lg:text-xl font-black text-zinc-900 tracking-tight">{stats.totalRepeated}</p>
        </div>
      </div>

      <div
        className="bg-white rounded-3xl p-5 lg:p-3.5 shadow-sm border border-zinc-200/60 flex flex-col gap-4 lg:gap-2 hover:shadow-md transition-shadow lg:h-[84px]"
        aria-label={`Álbum completado en ${stats.percentage}%. ${completionLabel}.`}
      >
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4 lg:gap-3 text-center lg:text-left">
          <div className="p-3 lg:p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <CircleGauge className="h-6 w-6 lg:h-5 lg:w-5" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Completado</p>
            <p className="text-2xl lg:text-xl font-black text-zinc-900 tracking-tight leading-none">{stats.percentage}%</p>
            <p className="text-sm lg:text-xs text-zinc-500 font-medium mt-1 leading-tight whitespace-nowrap">{completionLabel}</p>
          </div>
        </div>
        <ProgressBar
          percentage={stats.percentage}
          height="h-1.5"
          className="mt-auto lg:ml-[52px] lg:w-[calc(100%_-_52px)]"
        />
      </div>
    </div>
  )
}
