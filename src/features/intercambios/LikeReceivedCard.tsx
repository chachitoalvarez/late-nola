import { Heart, X, Package, Layers } from 'lucide-react'
import type { TradeUser } from '@/types/trade'

interface Props {
  user: TradeUser
  onAccept: (user: TradeUser) => void
  onReject: (user: TradeUser) => void
}

export function LikeReceivedCard({ user, onAccept, onReject }: Props) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:bg-zinc-50 transition-colors shadow-sm">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 relative border border-red-100 shadow-inner">
          <Heart className="w-6 h-6 text-red-400 fill-red-400/20" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-zinc-900 text-lg truncate tracking-tight">{user.name}</h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs sm:text-sm mt-1">
            <span className="flex items-center gap-1.5 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
              <Package className="w-3.5 h-3.5" /> Recibes {user.hasForYou}
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
              <Layers className="w-3.5 h-3.5" /> Entregas {user.youHaveForThem}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          onClick={() => onReject(user)}
          className="flex-1 sm:flex-none flex items-center justify-center p-3 bg-white border-2 border-zinc-200 text-zinc-400 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all active:scale-90"
        >
          <X className="w-6 h-6" strokeWidth={3} />
        </button>
        <button
          onClick={() => onAccept(user)}
          className="flex-1 sm:flex-none flex items-center justify-center p-3 bg-white border-2 border-zinc-200 text-emerald-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200 transition-all active:scale-90 hover:shadow-md"
        >
          <Heart className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
