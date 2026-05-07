import { User, MapPin } from 'lucide-react'
import type { TradeUser } from '@/types/trade'

export function LikeSentCard({ user }: { user: TradeUser }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0 border border-zinc-200">
          <User className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <h4 className="font-bold text-zinc-800 truncate tracking-tight">{user.name}</h4>
          <p className="text-xs font-semibold text-zinc-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {user.distance}
          </p>
        </div>
      </div>
      <span className="text-xs font-black tracking-wider text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 uppercase">Pendiente</span>
    </div>
  )
}
