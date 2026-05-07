import { Star, Package, CheckCircle2, Layers, Globe, Trophy, Award } from 'lucide-react'
import type { AchievementIcon } from '@/types/achievement'

export function renderAchievementIcon(type: AchievementIcon | string, className: string) {
  switch (type) {
    case 'star': return <Star className={className} />
    case 'piechart': return <Package className={className} />
    case 'check': return <CheckCircle2 className={className} />
    case 'layers': return <Layers className={className} />
    case 'globe': return <Globe className={className} />
    case 'trophy': return <Trophy className={className} />
    default: return <Award className={className} />
  }
}
