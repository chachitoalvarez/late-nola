// TODO: replace mock returns with Supabase calls when integrating
import { albumData } from '@/data/albumData'
import type { AlbumSection } from '@/types/album'

export async function getAlbum(): Promise<AlbumSection[]> {
  return albumData
}

export async function updateSticker(_section: string, _num: number, _count: number): Promise<void> {
  // TODO: supabase.from('stickers').upsert(...)
}
