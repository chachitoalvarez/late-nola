import { Compass, MessageCircle, ArrowUpRight, Inbox } from 'lucide-react'
import type { IntercambiosTab } from '@/lib/constants'

interface Props {
  activeTab: IntercambiosTab
  onTabChange: (tab: IntercambiosTab) => void
  unreadConnectionsCount: number
  likedByThemCount: number
}

export function IntercambiosTabs({ activeTab, onTabChange, unreadConnectionsCount, likedByThemCount }: Props) {
  const tabs: Array<{ id: IntercambiosTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'explorar', label: 'Explorar', icon: <Compass className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2.5} /> },
    { id: 'conexiones', label: 'Conexiones', icon: <MessageCircle className="w-5 h-5 sm:w-4 sm:h-4" strokeWidth={2.5} />, badge: unreadConnectionsCount },
    { id: 'dados', label: 'Enviados', icon: <ArrowUpRight className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2.5} /> },
    { id: 'recibidos', label: 'Recibidos', icon: <Inbox className="w-5 h-5 sm:w-4 sm:h-4" strokeWidth={2.5} />, badge: likedByThemCount },
  ]

  return (
    <div className="-mx-1 w-full overflow-x-auto border-b border-zinc-100 px-1 pb-1">
      <div className="flex min-w-max items-end gap-1.5 lg:gap-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-1.5 rounded-t-xl border-b-2 px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/20 lg:text-sm ${
                isActive
                  ? 'border-amber-500 bg-amber-50/40 text-amber-600'
                  : 'border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
              {(tab.badge ?? 0) > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black leading-none text-white shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
