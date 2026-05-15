/**
 * Album data layer.
 *
 * On first import, builds the catalog from the bundled JSON (synchronous, for
 * initial render). Once the app calls `initCatalogFromSupabase()`, the in-memory
 * maps are replaced with data fetched from Supabase and cached in localStorage.
 *
 * All other modules import from here — they never touch the JSON or Supabase directly.
 */

import rawData from './panini_mundial_2026_980_limpio.json'
import type { Sticker, AlbumSection, StickerType, TipoColeccion, Acabado } from '@/types/album'
import { loadCatalog, type CatalogData } from '@/services/catalog.service'

interface RawSticker {
  numero_orden: number
  seccion: string
  subseccion: string
  codigo_figura: string
  pais_equipo: string
  nombre_figura: string
  nombre_jugador: string
  tipo_figura: string
  tipo_coleccion: string
  es_especial: boolean
  acabado: string
}

// ── Build initial catalog from bundled JSON (synchronous) ──

function buildFromJSON(): {
  stickers: Sticker[]
  sections: AlbumSection[]
  byCode: Map<string, Sticker>
  bySubseccion: Map<string, Sticker[]>
  codesBySubseccion: Map<string, Set<string>>
} {
  const stickers: Sticker[] = (rawData.figuritas as RawSticker[]).map(f => ({
    id: `wc2026:base:${f.codigo_figura}`,
    numeroOrden: f.numero_orden,
    seccion: f.seccion,
    subseccion: f.subseccion,
    codigoFigura: f.codigo_figura,
    paisEquipo: f.pais_equipo,
    nombreFigura: f.nombre_figura,
    nombreJugador: f.nombre_jugador,
    tipoFigura: f.tipo_figura as StickerType,
    tipoColeccion: f.tipo_coleccion as TipoColeccion,
    esEspecial: f.es_especial,
    acabado: f.acabado as Acabado,
  }))

  const byCode = new Map<string, Sticker>(stickers.map(s => [s.codigoFigura, s]))

  const bySubseccion = new Map<string, Sticker[]>()
  const codesBySubseccion = new Map<string, Set<string>>()
  for (const s of stickers) {
    const arr = bySubseccion.get(s.subseccion) ?? []
    arr.push(s)
    bySubseccion.set(s.subseccion, arr)

    const codes = codesBySubseccion.get(s.subseccion) ?? new Set<string>()
    codes.add(s.codigoFigura)
    codesBySubseccion.set(s.subseccion, codes)
  }

  const sectionMap = new Map<string, { stickers: Sticker[]; seccion: string }>()
  for (const s of stickers) {
    const existing = sectionMap.get(s.subseccion)
    if (existing) {
      existing.stickers.push(s)
    } else {
      sectionMap.set(s.subseccion, { stickers: [s], seccion: s.seccion })
    }
  }

  const sections: AlbumSection[] = []
  for (const [subseccion, { stickers: stickerList, seccion }] of sectionMap) {
    const sorted = stickerList.sort((a, b) => a.numeroOrden - b.numeroOrden)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const prefixMatch = first.codigoFigura.match(/^([A-Z]+)/)
    const codigoBase = prefixMatch ? prefixMatch[1] : ''

    sections.push({
      section: subseccion,
      needed: stickerList.length,
      collected: {},
      seccion,
      subseccion,
      codigoBase,
      ordenInicio: first.numeroOrden,
      ordenFin: last.numeroOrden,
      cantidad: stickerList.length,
    })
  }

  sections.sort((a, b) => a.ordenInicio - b.ordenInicio)

  return { stickers, sections, byCode, bySubseccion, codesBySubseccion }
}

const initial = buildFromJSON()

// ── Mutable module-level state (replaced when Supabase catalog loads) ──

export let albumStickers: Sticker[] = initial.stickers
export let albumSections: AlbumSection[] = initial.sections
export let albumData: AlbumSection[] = initial.sections
export let stickersByCode: Map<string, Sticker> = initial.byCode
export let stickersBySubseccion: Map<string, Sticker[]> = initial.bySubseccion
export let stickerCodesBySubseccion: Map<string, Set<string>> = initial.codesBySubseccion

export const albumMeta = {
  slug: rawData.album.slug,
  nombre: rawData.album.nombre,
  totalFiguritas: rawData.album.total_figuritas,
}

// ── Async initialization from Supabase ──

let initPromise: Promise<void> | null = null

/**
 * Call once at app startup. Fetches the catalog from Supabase (or localStorage cache),
 * then replaces the module-level exports with the remote data.
 *
 * Safe to call multiple times — only the first call triggers the fetch.
 * Returns a promise that resolves when the catalog is ready.
 */
export function initCatalogFromSupabase(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = loadCatalog()
    .then((catalog: CatalogData) => {
      albumStickers = catalog.stickers
      albumSections = catalog.sections
      albumData = catalog.sections
      stickersByCode = catalog.byCode
      stickersBySubseccion = catalog.bySubseccion
      stickerCodesBySubseccion = catalog.codesBySubseccion
    })
    .catch((err) => {
      // Supabase unavailable — keep using bundled JSON (already loaded)
      console.warn('[albumData] Supabase catalog load failed, using bundled JSON:', err)
    })

  return initPromise
}
