import { User, Package, Layers, MessageSquare } from 'lucide-react'
import type { Connection } from '@/types/trade'

interface Props {
  connection: Connection
  onOpenChat: (user: Connection) => void
}

export function ConnectionCard({ connection, onOpenChat }: Props) {
  return (
    <div
      className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:bg-zinc-50 hover:shadow-md hover:border-zinc-200 transition-all relative overflow-hidden group cursor-pointer"
      onClick={() => onOpenChat(connection)}
    >
      <div className="flex items-center gap-4 w-full sm:w-auto z-10">
        <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0 relative border border-white shadow-sm group-hover:shadow-md transition-shadow">
          <User className="w-6 h-6 text-zinc-400" />
          {connection.isNew && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-zinc-900 text-lg truncate tracking-tight">{connection.name}</h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-zinc-500 mt-1">
            <span className="flex items-center gap-1.5 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
              <Package className="w-3.5 h-3.5" /> Recibes {connection.hasForYou}
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
              <Layers className="w-3.5 h-3.5" /> Entregas {connection.youHaveForThem}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto relative z-10">
        <button
          onClick={e => { e.stopPropagation(); onOpenChat(connection) }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold relative active:scale-95"
        >
          <MessageSquare className="w-4 h-4" strokeWidth={2.5} /> Chatear
          {connection.hasUnread && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-zinc-900 shadow-sm" />
            </span>
          )}
        </button>
      </div>
      {connection.hasUnread && <div className="absolute inset-0 bg-amber-50/30 z-0" />}
    </div>
  )
}
