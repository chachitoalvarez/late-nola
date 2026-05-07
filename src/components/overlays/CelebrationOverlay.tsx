import { Confetti } from './Confetti'
import { renderAchievementIcon } from '@/lib/icons'
import type { Celebration } from '@/hooks/useCelebration'

interface Props {
  celebration: Celebration
}

export function CelebrationOverlay({ celebration }: Props) {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {celebration.type === 'achievement' && <Confetti />}
      <div className="animate-float-up bg-white/90 backdrop-blur-xl px-6 py-5 sm:px-8 sm:py-6 rounded-3xl shadow-2xl shadow-amber-500/20 border border-white flex flex-col items-center gap-3 text-center mx-4 max-w-sm">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner border border-white ${
          celebration.type === 'achievement'
            ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600'
            : 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600'
        }`}>
          {renderAchievementIcon(celebration.icon, 'w-8 h-8 drop-shadow-sm')}
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-800 tracking-tight whitespace-pre-line leading-tight">
          {celebration.message}
        </h2>
      </div>
    </div>
  )
}
