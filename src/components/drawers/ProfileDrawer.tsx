import { X, Settings, User, Edit2, Mail, Bell, Shield, LogOut } from 'lucide-react'
import type { AlbumStats } from '@/types/album'

interface Props {
  isOpen: boolean
  onClose: () => void
  userName: string
  setUserName: (v: string) => void
  authEmail: string
  stats: AlbumStats
  unlockedAchievementsCount: number
  connectionsCount: number
  groupsCount: number
  onLogout: () => void
}

export function ProfileDrawer({
  isOpen, onClose, userName, setUserName, authEmail,
  stats, unlockedAchievementsCount, connectionsCount, groupsCount, onLogout,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="w-full md:w-[400px] bg-zinc-50 h-[100dvh] shadow-2xl flex flex-col relative z-10 animate-in slide-in-from-right-8 duration-300 rounded-l-[2rem] md:rounded-l-none overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200/60 flex justify-between items-center bg-white z-20 pt-[calc(1rem+env(safe-area-inset-top))]">
          <h2 className="font-black text-xl text-zinc-900 flex items-center gap-2 tracking-tight">
            <Settings className="w-5 h-5 text-zinc-400" strokeWidth={2.5} /> Ajustes
          </h2>
          <button onClick={onClose} className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors active:scale-90">
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          <div className="p-8 flex flex-col items-center border-b border-zinc-200/60 bg-white">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-white shadow-lg flex items-center justify-center relative mb-5">
              <User className="w-12 h-12 text-amber-500" strokeWidth={2.5} />
              <button className="absolute bottom-0 right-0 bg-zinc-900 text-white p-2 rounded-full border-2 border-white hover:bg-zinc-800 transition-colors shadow-sm active:scale-90">
                <Edit2 className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="w-full relative group">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 flex justify-center">Nombre Público</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full text-center text-2xl font-black text-zinc-900 bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:border-amber-500 focus:outline-none transition-colors pb-1 tracking-tight"
              />
              <Edit2 className="w-3 h-3 text-zinc-300 absolute right-8 top-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
            </div>
            <div className="mt-3 text-sm font-medium text-zinc-500 bg-zinc-100 px-4 py-1.5 rounded-full border border-zinc-200/60 flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-400" strokeWidth={2.5} /> {authEmail}
            </div>
          </div>

          <div className="p-6 border-b border-zinc-200/60 bg-zinc-50/50">
            <h3 className="font-black text-zinc-800 mb-4 tracking-tight">Tu Rendimiento</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: `${stats.percentage}%`, label: 'Completado', color: 'text-amber-600' },
                { value: unlockedAchievementsCount, label: 'Logros', color: 'text-emerald-600' },
                { value: connectionsCount, label: 'Conexiones', color: 'text-blue-600' },
                { value: groupsCount, label: 'Grupos', color: 'text-purple-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-4 rounded-2xl border border-zinc-200/60 text-center shadow-sm">
                  <p className={`text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-5 bg-white">
            <h3 className="font-black text-zinc-800 mb-2 tracking-tight">Preferencias</h3>
            {[
              { icon: <Bell className="w-5 h-5 text-zinc-600" />, label: 'Notificaciones', sub: 'Avisos de nuevos matches' },
              { icon: <Shield className="w-5 h-5 text-zinc-600" />, label: 'Perfil Público', sub: 'Visible en explorador' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-2xl transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-100 p-2.5 rounded-xl border border-zinc-200">{item.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-zinc-800">{item.label}</p>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">{item.sub}</p>
                  </div>
                </div>
                <div className="w-12 h-7 bg-emerald-500 rounded-full relative shadow-inner border border-emerald-600">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-1 shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200/60 bg-white pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-10px_20px_rgb(0,0,0,0.02)]">
          <button
            onClick={onLogout}
            className="w-full bg-red-50 border-2 border-red-100 text-red-600 font-bold py-3.5 px-4 rounded-2xl hover:bg-red-100 hover:border-red-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.5} /> Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
