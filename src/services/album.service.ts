import { supabase } from '@/services/supabase'
import { albumData as baseAlbumData } from '@/data/albumData'
import type { AlbumSection, StickerCount } from '@/types/album'
import { LOCAL_STORAGE_KEY } from '@/lib/constants'

type CollectedMap = Record<string, StickerCount>

const TOTAL_NEEDED = baseAlbumData.reduce((acc, s) => acc + s.needed, 0)

function computeTotals(collected: CollectedMap): { uniqueCount: number; repeatedCount: number } {
  let uniqueCount = 0
  let repeatedCount = 0
  for (const section of Object.values(collected)) {
    for (const count of Object.values(section)) {
      if (count > 0) uniqueCount++
      if (count > 1) repeatedCount += count - 1
    }
  }
  return { uniqueCount, repeatedCount }
}

function toCollectedMap(data: AlbumSection[]): CollectedMap {
  const map: CollectedMap = {}
  for (const s of data) {
    if (Object.keys(s.collected).length > 0) map[s.section] = s.collected
  }
  return map
}

function toAlbumData(collected: CollectedMap): AlbumSection[] {
  return baseAlbumData.map(s => ({
    ...s,
    collected: (collected[s.section] ?? {}) as StickerCount,
  }))
}

export async function getAlbumState(): Promise<{ data: AlbumSection[] | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No hay sesión activa' }

  // Migrate from localStorage for first-time Supabase users
  let migratedCollected: CollectedMap = {}
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      const parsed: AlbumSection[] = JSON.parse(stored)
      migratedCollected = toCollectedMap(parsed)
    }
  } catch { /* ignore */ }

  const { uniqueCount, repeatedCount } = computeTotals(migratedCollected)

  // ignoreDuplicates: true — creates row if missing, leaves existing row untouched
  const { data: upserted, error: upsertErr } = await supabase
    .from('user_album_state')
    .upsert(
      { user_id: user.id, collected: migratedCollected, unique_count: uniqueCount, repeated_count: repeatedCount, total_needed: TOTAL_NEEDED },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )
    .select('collected')
    .single()

  if (upserted) return { data: toAlbumData(upserted.collected as CollectedMap), error: null }

  // ignoreDuplicates suppresses the return when row already existed — fetch it
  const { data: existing, error: selectErr } = await supabase
    .from('user_album_state')
    .select('collected')
    .eq('user_id', user.id)
    .single()

  if (selectErr) return { data: null, error: upsertErr?.message ?? selectErr.message }
  return { data: toAlbumData(existing.collected as CollectedMap), error: null }
}

export async function saveAlbumState(albumData: AlbumSection[]): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No hay sesión activa' }

  const collected = toCollectedMap(albumData)
  const { uniqueCount, repeatedCount } = computeTotals(collected)

  const { error } = await supabase
    .from('user_album_state')
    .upsert(
      { user_id: user.id, collected, unique_count: uniqueCount, repeated_count: repeatedCount, total_needed: TOTAL_NEEDED },
      { onConflict: 'user_id' }
    )

  return { error: error?.message ?? null }
}
