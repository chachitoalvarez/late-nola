import { Heart } from 'lucide-react'

interface Props {
  label?: string
}

export function MatchAnimation({ label = '¡MATCH!' }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white/80 backdrop-blur-md absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-300">
        <div className="bg-emerald-100 p-5 rounded-full mb-5 shadow-inner">
          <Heart className="w-20 h-20 text-emerald-500 fill-emerald-500 animate-pulse" />
        </div>
        <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">{label}</h3>
      </div>
    </div>
  )
}
