import { Award, CheckCircle2, ListChecks, RefreshCcw, Trophy, Users } from 'lucide-react'
import type { Tab } from '@/lib/constants'

export const navigationItems: Array<{ id: Tab; label: string; icon: (active: boolean, className?: string) => React.ReactNode }> = [
  { id: 'resumen', label: 'Resumen', icon: (active, className = 'w-5 h-5') => <CheckCircle2 className={className} strokeWidth={active ? 3 : 2.25} /> },
  { id: 'detalle', label: 'Detalle', icon: (active, className = 'w-5 h-5') => <ListChecks className={className} strokeWidth={active ? 3 : 2.25} /> },
  { id: 'comparar', label: 'Ranking', icon: (active, className = 'w-5 h-5') => <Users className={className} strokeWidth={active ? 3 : 2.25} /> },
  { id: 'intercambios', label: 'Canjes', icon: (active, className = 'w-5 h-5') => <RefreshCcw className={className} strokeWidth={active ? 3 : 2.25} /> },
  { id: 'prode', label: 'Prode', icon: (active, className = 'w-5 h-5') => <Trophy className={className} strokeWidth={active ? 3 : 2.25} /> },
  { id: 'logros', label: 'Logros', icon: (active, className = 'w-5 h-5') => <Award className={className} strokeWidth={active ? 3 : 2.25} /> },
]

