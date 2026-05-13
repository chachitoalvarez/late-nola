import { ListChecks, CheckCircle2, Users, RefreshCcw, Award } from 'lucide-react'
import type { Tab } from '@/lib/constants'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  intercambiosBadge: number
  logrosBadge: number
}

export function BottomNav({ activeTab, onTabChange, intercambiosBadge, logrosBadge }: Props) {
  const navItems: Array<{ id: Tab; label: string; icon: (active: boolean) => React.ReactNode; badge?: number }> = [
    { id: 'resumen', label: 'Resumen', icon: (a) => <CheckCircle2 className="w-6 h-6" strokeWidth={a ? 3 : 2} /> },
    { id: 'detalle', label: 'Detalle', icon: (a) => <ListChecks className="w-6 h-6" strokeWidth={a ? 3 : 2} /> },
    { id: 'comparar', label: 'Clasificación', icon: (a) => <Users className="w-6 h-6" strokeWidth={a ? 3 : 2} /> },
    { id: 'intercambios', label: 'Canjes', icon: (a) => <RefreshCcw className="w-6 h-6" strokeWidth={a ? 3 : 2} />, badge: intercambiosBadge },
    { id: 'logros', label: 'Logros', icon: (a) => <Award className="w-6 h-6" strokeWidth={a ? 3 : 2} />, badge: logrosBadge },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-200/60 flex justify-around items-center h-20 pb-[env(safe-area-inset-bottom)] z-40 px-2 shadow-[0_-10px_40px_rgb(0,0,0,0.03)] pt-1">
      {navItems.map(item => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            aria-label={item.label}
            title={item.label}
            className={`flex items-center justify-center flex-1 h-full transition-colors active:scale-95 ${isActive ? 'text-amber-600' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <div className="relative">
              {item.icon(isActive)}
              {(item.badge ?? 0) > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </nav>
  )
}
