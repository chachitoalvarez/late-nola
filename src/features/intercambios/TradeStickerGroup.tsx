import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface Props {
  sectionName: string
  stickers: Record<string, number>
  variant: 'theyOffer' | 'iOffer'
  defaultOpen?: boolean
}

export function TradeStickerGroup({ sectionName, stickers, variant, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const isAmber = variant === 'theyOffer'
  const stickerEntries = Object.entries(stickers)

  return (
    <div className="overflow-hidden rounded-xl">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors active:scale-[0.98] ${isAmber ? 'bg-amber-100/60 hover:bg-amber-100' : 'bg-blue-100/60 hover:bg-blue-100'}`}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`w-4 h-4 transition-transform ${isAmber ? 'text-amber-700' : 'text-blue-700'} ${open ? 'rotate-90' : ''}`}
            strokeWidth={3}
          />
          <span className={`text-sm font-black tracking-tight ${isAmber ? 'text-amber-900' : 'text-blue-900'}`}>
            {sectionName}
          </span>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isAmber ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'}`}>
          {stickerEntries.length}
        </span>
      </button>

      {open && (
        <div className={`p-3 flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-1 ${isAmber ? 'bg-amber-50/50' : 'bg-blue-50/50'}`}>
          {stickerEntries
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([num, count]) => (
              <span
                key={num}
                className={`text-xs font-black px-2.5 py-1 rounded-lg shadow-sm border bg-white ${isAmber ? 'border-amber-200 text-amber-800' : 'border-blue-200 text-blue-800'}`}
              >
                #{num}{count > 1 && <span className="ml-1 text-[10px] font-bold opacity-70">×{count}</span>}
              </span>
            ))
          }
        </div>
      )}
    </div>
  )
}
