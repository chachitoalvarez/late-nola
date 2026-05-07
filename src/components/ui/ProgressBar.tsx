import { getProgressColor } from '@/lib/stats'

interface Props {
  percentage: number
  className?: string
  height?: string
}

export function ProgressBar({ percentage, className = '', height = 'h-2.5' }: Props) {
  return (
    <div className={`w-full bg-zinc-100 rounded-full ${height} overflow-hidden shadow-inner ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(percentage)}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
