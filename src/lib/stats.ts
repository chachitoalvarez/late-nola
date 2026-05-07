import type { AlbumSection, AlbumStats } from '@/types/album'

export function getProgressColor(percentage: number): string {
  if (percentage === 100) return 'bg-emerald-500'
  if (percentage >= 50) return 'bg-blue-500'
  if (percentage > 0) return 'bg-amber-400'
  return 'bg-zinc-200'
}

export function getSectionUniqueCount(section: AlbumSection): number {
  return Object.values(section.collected).filter(v => v > 0).length
}

export function getSectionRepeatedCount(section: AlbumSection): number {
  return Object.values(section.collected).reduce(
    (sum, count) => sum + (count > 1 ? count - 1 : 0),
    0
  )
}

export function getSectionPercentage(section: AlbumSection): number {
  const unique = getSectionUniqueCount(section)
  return Math.round((unique / section.needed) * 100)
}

export function computeStats(albumData: AlbumSection[]): AlbumStats {
  const totalNeeded = albumData.reduce((acc, curr) => acc + curr.needed, 0)
  const totalCompleted = albumData.reduce(
    (acc, curr) => acc + getSectionUniqueCount(curr),
    0
  )
  const totalRepeated = albumData.reduce(
    (acc, curr) => acc + getSectionRepeatedCount(curr),
    0
  )
  const percentage = totalNeeded === 0 ? 0 : Math.round((totalCompleted / totalNeeded) * 100)
  return { totalNeeded, totalCompleted, percentage, missing: totalNeeded - totalCompleted, totalRepeated }
}
