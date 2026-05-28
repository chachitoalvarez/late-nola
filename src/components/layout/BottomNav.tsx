import type { Tab } from '@/lib/constants'
import { navigationItems } from '@/lib/navigation'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  intercambiosBadge: number
  logrosBadge: number
  canAccessProde: boolean
}

export function BottomNav({ activeTab, onTabChange, intercambiosBadge, logrosBadge, canAccessProde }: Props) {
  const visibleItems = navigationItems.filter(item => canAccessProde || item.id !== 'prode')

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-200/60 flex justify-around items-center h-20 pb-[env(safe-area-inset-bottom)] z-40 px-2 shadow-[0_-10px_40px_rgb(0,0,0,0.03)] pt-1">
      {visibleItems.map(item => {
        const isActive = activeTab === item.id
        const badge = item.id === 'intercambios' ? intercambiosBadge : item.id === 'logros' ? logrosBadge : 0
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            aria-label={item.label}
            title={item.label}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-colors active:scale-95 ${isActive ? 'text-amber-600' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <div className="relative">
              {item.icon(isActive, 'w-6 h-6')}
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-wide leading-none">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
