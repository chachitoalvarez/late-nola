import { useState } from 'react'

export interface Celebration {
  id: number
  type: 'sticker' | 'achievement' | 'match'
  message: string
  icon: string
}

export function useCelebration() {
  const [celebration, setCelebration] = useState<Celebration | null>(null)

  const triggerCelebration = (type: Celebration['type'], message: string, iconStr: string) => {
    setCelebration({ id: Date.now(), type, message, icon: iconStr })
    setTimeout(() => setCelebration(null), 3000)
  }

  return { celebration, triggerCelebration }
}
