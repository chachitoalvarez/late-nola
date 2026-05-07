import { UsersRound, Mail } from 'lucide-react'

interface Props {
  newGroupName: string
  setNewGroupName: (v: string) => void
  newGroupEmails: string
  setNewGroupEmails: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function CreateGroupForm({ newGroupName, setNewGroupName, newGroupEmails, setNewGroupEmails, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="bg-gradient-to-br from-white to-amber-50/30 p-6 sm:p-8 rounded-3xl border border-amber-200/60 shadow-lg shadow-amber-500/5 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
          <UsersRound className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <h3 className="font-black text-2xl text-zinc-900 tracking-tight">Crear Grupo Privado</h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-2">Nombre del Grupo</label>
          <input
            type="text"
            required
            placeholder="Ej: Amigos del Club, Los Pibes..."
            className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium transition-all shadow-sm"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-zinc-400" /> Invitar Amigos (Emails)
          </label>
          <textarea
            rows={2}
            placeholder="amigo1@mail.com, amigo2@mail.com"
            className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm font-medium transition-all shadow-sm resize-none"
            value={newGroupEmails}
            onChange={e => setNewGroupEmails(e.target.value)}
          />
        </div>
        <div className="flex justify-end pt-3">
          <button type="submit" className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all active:scale-[0.98] shadow-md shadow-amber-500/20 w-full sm:w-auto">
            Crear y Compartir Enlace
          </button>
        </div>
      </div>
    </form>
  )
}
