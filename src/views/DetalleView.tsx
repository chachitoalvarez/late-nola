import { DetalleFiltersBar } from '@/features/detalle/DetalleFiltersBar'
import { StickerGrid } from '@/features/detalle/StickerGrid'
import type { AlbumSection, AlbumStats } from '@/types/album'

interface Props {
  albumData: AlbumSection[]
  selectedSection: string
  setSelectedSection: (v: string) => void
  showOnlyRepeated: boolean
  setShowOnlyRepeated: (v: boolean) => void
  currentSectionData: AlbumSection | null
  stats: AlbumStats
  onMarkAll: () => void
  onClearAll: () => void
  onUpdateCount: (section: string, num: number, delta: number) => void
}

export function DetalleView({
  albumData, selectedSection, setSelectedSection,
  showOnlyRepeated, setShowOnlyRepeated,
  currentSectionData, stats, onMarkAll, onClearAll, onUpdateCount,
}: Props) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative">
      <DetalleFiltersBar
        albumData={albumData}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        showOnlyRepeated={showOnlyRepeated}
        setShowOnlyRepeated={setShowOnlyRepeated}
        onMarkAll={onMarkAll}
        onClearAll={onClearAll}
        stats={stats}
      />

      <div className="space-y-8 sm:space-y-10">
        {selectedSection === 'all'
          ? albumData.map(section => (
              <StickerGrid
                key={section.section}
                sectionData={section}
                showOnlyRepeated={showOnlyRepeated}
                onUpdateCount={onUpdateCount}
              />
            ))
          : currentSectionData && (
              <StickerGrid
                sectionData={currentSectionData}
                showOnlyRepeated={showOnlyRepeated}
                onUpdateCount={onUpdateCount}
              />
            )
        }
      </div>
    </div>
  )
}
