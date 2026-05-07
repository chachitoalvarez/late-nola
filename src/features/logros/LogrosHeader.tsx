import { Trophy } from 'lucide-react'

interface Props {
  unlockedCount: number
}

export function LogrosHeader({ unlockedCount }: Props) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200/60 rounded-3xl p-6 sm:p-8 flex items-center gap-5 sm:gap-6 shadow-sm relative overflow-hidden">
      <div className="absolute right-0 top-0 w-48 h-48 bg-amber-400 rounded-full blur-[80px] opacity-10 pointer-events-none" />
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 relative shadow-inner border border-amber-200 rotate-3">
        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" strokeWidth={2.5} />
        <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white font-black w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white flex items-center justify-center text-xs sm:text-sm shadow-md">
          {unlockedCount}
        </div>
      </div>
      <div className="relative z-10">
        <h2 className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight">Tus Logros</h2>
        <p className="text-amber-700 text-xs sm:text-sm mt-1 font-medium leading-relaxed max-w-xl">
          Desbloquea logros y colecciona medallas exclusivas a medida que avanzas. Se mostrarán en tu perfil público para destacar tu progreso como coleccionista.
        </p>
      </div>
    </div>
  )
}
