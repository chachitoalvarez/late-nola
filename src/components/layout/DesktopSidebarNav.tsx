import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { PROJECT_SLUG, type Tab } from '@/lib/constants'
import { navigationItems } from '@/lib/navigation'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  isExpanded: boolean
  onExpandedChange: (isExpanded: boolean) => void
}

export const DESKTOP_SIDEBAR_STORAGE_KEY = `${PROJECT_SLUG}:desktop-sidebar-expanded`
export const DESKTOP_SIDEBAR_EXPANDED_WIDTH = 224
export const DESKTOP_SIDEBAR_COLLAPSED_WIDTH = 80

export function DesktopSidebarNav({ activeTab, onTabChange, isExpanded, onExpandedChange }: Props) {
  useEffect(() => {
    try {
      window.localStorage.setItem(DESKTOP_SIDEBAR_STORAGE_KEY, String(isExpanded))
    } catch { /* ignore */ }
  }, [isExpanded])

  return (
    <aside
      className={`fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-zinc-200/70 bg-white/95 p-3 shadow-sm backdrop-blur-xl transition-[width] duration-200 ease-out md:flex ${
        isExpanded ? 'w-[224px]' : 'w-[80px]'
      }`}
      aria-label="Navegación principal"
    >
      <div className={`mb-5 flex h-14 items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        {isExpanded && (
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Menu className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-black text-zinc-900">Late Nola</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => onExpandedChange(!isExpanded)}
          aria-label={isExpanded ? 'Colapsar navegación' : 'Expandir navegación'}
          aria-expanded={isExpanded}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/20"
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Navegación principal">
        {navigationItems.map(item => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              title={isExpanded ? undefined : item.label}
              className={`group relative flex h-12 items-center rounded-2xl text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/20 ${
                isExpanded ? 'justify-start gap-3 px-3' : 'justify-center px-0'
              } ${
                isActive
                  ? 'bg-amber-50 text-amber-700 shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <span className="shrink-0">{item.icon(isActive, 'h-5 w-5')}</span>
              {isExpanded && <span className="truncate">{item.label}</span>}
              {!isExpanded && (
                <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 rounded-xl bg-zinc-900 px-2.5 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
