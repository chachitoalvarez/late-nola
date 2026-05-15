import type { ReactNode } from 'react'
import { CircleGauge, Layers, LayoutGrid, Package } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { AlbumStats } from '@/types/album'

const CARD_CLASS = 'bg-white rounded-3xl p-5 lg:p-3.5 shadow-sm border border-zinc-200/60 flex flex-col lg:flex-row items-center gap-4 lg:gap-3 text-center lg:text-left hover:shadow-md transition-shadow lg:h-[96px]'
const LABEL_CLASS = 'text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5 leading-4'
const VALUE_CLASS = 'text-2xl lg:text-xl font-black text-zinc-900 tracking-tight leading-7 lg:leading-6'

interface MetricCardProps {
  icon: ReactNode
  iconClassName: string
  label: string
  value: ReactNode
  secondary?: ReactNode
  progress?: ReactNode
  ariaLabel?: string
}

function MetricCard({ icon, iconClassName, label, value, secondary, progress, ariaLabel }: MetricCardProps) {
  return (
    <div className={CARD_CLASS} aria-label={ariaLabel}>
      <div className={`p-3 lg:p-2.5 rounded-2xl border ${iconClassName}`}>
        {icon}
      </div>
      <div className="w-full min-w-0 lg:flex-1">
        <p className={LABEL_CLASS}>{label}</p>
        <p className={VALUE_CLASS}>{value}</p>
        {secondary && (
          <p className="mt-0.5 text-sm lg:text-xs font-medium leading-5 lg:leading-4 text-zinc-500 whitespace-nowrap">
            {secondary}
          </p>
        )}
        {progress}
      </div>
    </div>
  )
}

export function StatsCards({ stats }: { stats: AlbumStats }) {
  const completionLabel = stats.percentage >= 100
    ? 'Álbum completo'
    : `${stats.missing === 1 ? 'Falta' : 'Faltan'} ${stats.missing}`

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-3.5">
      <MetricCard
        icon={<LayoutGrid className="h-6 w-6 lg:h-5 lg:w-5" strokeWidth={2.5} />}
        iconClassName="bg-blue-50 text-blue-600 border-blue-100"
        label="Total"
        value={stats.totalNeeded}
      />

      <MetricCard
        icon={<Package className="h-6 w-6 lg:h-5 lg:w-5" strokeWidth={2.5} />}
        iconClassName="bg-emerald-50 text-emerald-600 border-emerald-100"
        label="Pegadas"
        value={stats.totalCompleted}
      />

      <MetricCard
        icon={<Layers className="h-6 w-6 lg:h-5 lg:w-5" strokeWidth={2.5} />}
        iconClassName="bg-amber-50 text-amber-600 border-amber-100"
        label="Repetidas"
        value={stats.totalRepeated}
      />

      <MetricCard
        icon={<CircleGauge className="h-6 w-6 lg:h-5 lg:w-5" strokeWidth={2.5} />}
        iconClassName="bg-amber-50 text-amber-600 border-amber-100"
        label="Completado"
        value={`${stats.percentage}%`}
        secondary={completionLabel}
        progress={(
          <ProgressBar
            percentage={stats.percentage}
            height="h-1.5"
            className="mt-2"
          />
        )}
        ariaLabel={`Álbum completado en ${stats.percentage}%. ${completionLabel}.`}
      />
    </div>
  )
}
