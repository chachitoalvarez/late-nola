import type { AlbumSection, AlbumStats } from '@/types/album'

export function isExtrasSection(section: AlbumSection): boolean {
  return section.seccion === 'Extras Coca-Cola' || section.codigoBase === 'CC'
}

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
  const baseSections = albumData.filter(section => !isExtrasSection(section))
  const extraSections = albumData.filter(isExtrasSection)

  const totalNeeded = albumData.reduce((acc, curr) => acc + curr.needed, 0)
  const totalCompleted = albumData.reduce(
    (acc, curr) => acc + getSectionUniqueCount(curr),
    0
  )
  const totalRepeated = albumData.reduce(
    (acc, curr) => acc + getSectionRepeatedCount(curr),
    0
  )
  const baseNeeded = baseSections.reduce((acc, curr) => acc + curr.needed, 0)
  const baseCompleted = baseSections.reduce((acc, curr) => acc + getSectionUniqueCount(curr), 0)
  const baseRepeated = baseSections.reduce((acc, curr) => acc + getSectionRepeatedCount(curr), 0)
  const extrasNeeded = extraSections.reduce((acc, curr) => acc + curr.needed, 0)
  const extrasCompleted = extraSections.reduce((acc, curr) => acc + getSectionUniqueCount(curr), 0)
  const extrasRepeated = extraSections.reduce((acc, curr) => acc + getSectionRepeatedCount(curr), 0)

  const percentage = totalNeeded === 0 ? 0 : Math.round((totalCompleted / totalNeeded) * 100)
  const basePercentage = baseNeeded === 0 ? 0 : Math.round((baseCompleted / baseNeeded) * 100)
  const extrasPercentage = extrasNeeded === 0 ? 0 : Math.round((extrasCompleted / extrasNeeded) * 100)

  return {
    totalNeeded,
    totalCompleted,
    percentage,
    missing: totalNeeded - totalCompleted,
    totalRepeated,
    baseNeeded,
    baseCompleted,
    basePercentage,
    baseMissing: baseNeeded - baseCompleted,
    baseRepeated,
    extrasNeeded,
    extrasCompleted,
    extrasPercentage,
    extrasMissing: extrasNeeded - extrasCompleted,
    extrasRepeated,
  }
}
