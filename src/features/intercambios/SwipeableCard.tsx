import { User, MapPin, Heart, X, Search } from 'lucide-react'
import type { TradeUser } from '@/types/trade'

interface Props {
  user: TradeUser | null
  showMatchAnimation: boolean
  onSwipe: (direction: 'left' | 'right', user: TradeUser) => void
}

export function SwipeableCard({ user, showMatchAnimation, onSwipe }: Props) {
  if (!user) {
    return (
      <div className="relative bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center p-10 text-center animate-in fade-in min-h-[640px]">
        <div className="w-24 h-24 bg-zinc-200/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Search className="w-10 h-10 text-zinc-400" strokeWidth={2.5} />
        </div>
        <h3 className="text-2xl font-black text-zinc-800 tracking-tight">¡Eso es todo!</h3>
        <p className="text-zinc-500 font-medium mt-3 leading-relaxed">Todavía no hay coleccionistas con cruce con tu álbum. Volvé después de pegar más figuritas.</p>
      </div>
    )
  }

  return (
    <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-zinc-200/50 border border-zinc-200 overflow-hidden flex flex-col transition-all duration-300 transform ease-out hover:-translate-y-2 group min-h-[640px] h-auto">
      {showMatchAnimation && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="bg-emerald-100 p-5 rounded-full mb-5 shadow-inner">
            <Heart className="w-20 h-20 text-emerald-500 fill-emerald-500 animate-bounce" />
          </div>
          <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">¡MATCH!</h3>
        </div>
      )}

      <div className="bg-zinc-900 text-white p-5 sm:p-6 flex-shrink-0 relative overflow-hidden flex flex-col justify-end">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500 rounded-full blur-[80px] opacity-30 group-hover:opacity-40 transition-opacity" />
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 bg-zinc-800 border-2 border-zinc-700 rounded-full flex items-center justify-center shadow-md shrink-0">
              <User className="w-7 h-7 text-zinc-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-none truncate">{user.name}</h3>
          </div>
        </div>
        <div className="relative z-10 mt-4 flex items-center gap-1.5 text-xs font-bold text-zinc-300 bg-white/10 backdrop-blur-md w-fit px-3 py-1.5 rounded-xl border border-white/5 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.5} />
          {user.distance}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5 bg-gradient-to-b from-white to-zinc-50 relative z-20">
        <div className="bg-amber-50/80 border border-amber-100 p-5 rounded-3xl relative hover:shadow-md transition-shadow">
          <div className="absolute -top-3.5 left-5 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border-2 border-white">RECIBES</div>
          <p className="text-amber-900 font-medium leading-tight">
            Tiene <span className="font-black text-3xl tracking-tight mx-1">{user.hasForYou}</span> que te faltan.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.offers.map((offer, idx) => (
              <span key={idx} className="bg-white border border-amber-200 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                {offer}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-blue-50/80 border border-blue-100 p-5 rounded-3xl relative hover:shadow-md transition-shadow">
          <div className="absolute -top-3.5 left-5 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border-2 border-white">ENTREGAS</div>
          <p className="text-blue-900 font-medium leading-tight">
            Busca <span className="font-black text-3xl tracking-tight mx-1">{user.youHaveForThem}</span> de tus repetidas.
          </p>
        </div>
      </div>

      <div className="p-4 flex justify-center gap-8 bg-white border-t border-zinc-100 flex-shrink-0">
        <button
          onClick={() => onSwipe('left', user)}
          className="w-16 h-16 rounded-full bg-white border-[3px] border-zinc-200 text-zinc-400 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all shadow-sm hover:shadow-xl transform active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
        >
          <X className="w-8 h-8" strokeWidth={3} />
        </button>
        <button
          onClick={() => onSwipe('right', user)}
          className="w-16 h-16 rounded-full bg-white border-[3px] border-zinc-200 text-emerald-400 flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-500 transition-all shadow-sm hover:shadow-xl transform active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
        >
          <Heart className="w-8 h-8" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
