export type AchievementIcon = 'star' | 'piechart' | 'check' | 'layers' | 'globe' | 'trophy'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: AchievementIcon
  color: string
  bg: string
  progress: number
  total: number
  unlocked: boolean
}
