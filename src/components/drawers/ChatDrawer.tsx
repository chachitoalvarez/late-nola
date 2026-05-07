import { X, User, Send, ShieldAlert } from 'lucide-react'
import type { Connection } from '@/types/trade'
import type { ChatMessage } from '@/types/chat'

interface Props {
  user: Connection
  history: ChatMessage[]
  chatMessage: string
  setChatMessage: (v: string) => void
  isTyping: boolean
  onClose: () => void
  onSend: (e: React.FormEvent) => void
}

export function ChatDrawer({ user, history, chatMessage, setChatMessage, isTyping, onClose, onSend }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="w-full md:w-[450px] bg-zinc-50 h-[100dvh] shadow-2xl flex flex-col relative z-10 animate-in slide-in-from-right-8 duration-300 rounded-l-[2rem] md:rounded-l-none overflow-hidden">

        <div className="px-6 py-4 border-b border-zinc-200/60 flex justify-between items-center bg-white shadow-sm z-20 pt-[calc(1rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
              <User className="w-6 h-6 text-zinc-400" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <p className="font-black text-zinc-900 text-lg tracking-tight">{user.name}</p>
              <p className="text-xs text-emerald-600 font-bold">{user.distance} • En línea</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors active:scale-90">
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="bg-amber-50/80 px-6 py-4 border-b border-amber-100 flex items-center justify-between text-sm shadow-sm z-10">
          <div className="flex flex-col">
            <span className="font-black text-amber-900">Recibes: {user.hasForYou} figuritas</span>
            <span className="text-amber-700 text-xs font-semibold">{user.offers?.join(', ') ?? 'Varias opciones'}</span>
          </div>
          <div className="text-right">
            <span className="font-black text-blue-900">Entregas: {user.youHaveForThem} tuyas</span>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col bg-zinc-50 pb-28">
          <div className="text-center text-[11px] uppercase tracking-wider text-zinc-400 font-bold bg-zinc-200/50 py-1.5 px-4 rounded-full self-center">
            Match de Intercambio - Hoy
          </div>

          {history.map((msg, i) => {
            if (msg.sender === 'system') {
              return (
                <div key={i} className="flex gap-3 items-start bg-blue-50 border border-blue-100 text-blue-800 text-sm p-4 rounded-2xl mx-auto my-2 shadow-sm animate-in fade-in">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
                  <p className="leading-relaxed font-medium">{msg.text}</p>
                </div>
              )
            }
            return (
              <div key={i} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[80%] p-3.5 text-[15px] font-medium shadow-sm ${
                  msg.sender === 'me'
                    ? 'bg-emerald-500 text-white rounded-[1.2rem] rounded-tr-sm'
                    : 'bg-white border border-zinc-200 text-zinc-800 rounded-[1.2rem] rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] font-bold text-zinc-400 mt-1 px-1">{msg.time ?? 'Ahora'}</span>
              </div>
            )
          })}

          {isTyping && (
            <div className="flex items-start animate-in fade-in">
              <div className="bg-white border border-zinc-200 rounded-[1.2rem] rounded-tl-sm p-4 shadow-sm flex gap-1.5 items-center">
                {[0, 150, 300].map(delay => (
                  <div key={delay} className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={onSend}
          className="p-4 bg-white border-t border-zinc-200/60 shadow-[0_-10px_20px_rgb(0,0,0,0.03)] pb-[calc(1rem+env(safe-area-inset-bottom))] absolute bottom-0 w-full z-20"
        >
          <div className="flex gap-2 items-center bg-zinc-100 rounded-full p-1.5 border border-zinc-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/20 transition-all focus-within:bg-white">
            <input
              type="text"
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              className="flex-1 bg-transparent border-transparent px-4 py-2 focus:outline-none text-[15px] font-medium text-zinc-800 placeholder-zinc-400"
              placeholder="Escribe un mensaje..."
            />
            <button
              type="submit"
              disabled={!chatMessage.trim()}
              className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-emerald-600 disabled:bg-zinc-300 transition-all flex-shrink-0 active:scale-90"
            >
              <Send className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
