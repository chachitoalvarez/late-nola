import { supabase } from '@/services/supabase'
import type { Sticker, AlbumSection, StickerType, TipoColeccion, Acabado } from '@/types/album'

const CACHE_KEY = 'latenola:stickers_catalog'
const CACHE_VERSION_KEY = 'latenola:stickers_catalog_version'
const CATALOG_VERSION = '2026-base-980-v1'

interface StickerRow {
  id: string
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

function rowToSticker(r: StickerRow): Sticker {
  return {
    id: r.id,
    numeroOrden: r.numero_orden,
    seccion: r.seccion,
    subseccion: r.subseccion,
    codigoFigura: r.codigo_figura,
    paisEquipo: r.pais_equipo,
    nombreFigura: r.nombre_figura,
    nombreJugador: r.nombre_jugador,
    tipoFigura: r.tipo_figura as StickerType,
    tipoColeccion: r.tipo_coleccion as TipoColeccion,
    esEspecial: r.es_especial,
    acabado: r.acabado as Acabado,
  }
}

function buildSections(stickers: Sticker[]): AlbumSection[] {
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

  return sections.sort((a, b) => a.ordenInicio - b.ordenInicio)
}

function buildIndices(stickers: Sticker[]) {
  const byCode = new Map<string, Sticker>()
  const bySubseccion = new Map<string, Sticker[]>()
  const codesBySubseccion = new Map<string, Set<string>>()

  for (const s of stickers) {
    byCode.set(s.codigoFigura, s)

    const arr = bySubseccion.get(s.subseccion) ?? []
    arr.push(s)
    bySubseccion.set(s.subseccion, arr)

    const codes = codesBySubseccion.get(s.subseccion) ?? new Set<string>()
    codes.add(s.codigoFigura)
    codesBySubseccion.set(s.subseccion, codes)
  }

  return { byCode, bySubseccion, codesBySubseccion }
}

export interface CatalogData {
  stickers: Sticker[]
  sections: AlbumSection[]
  byCode: Map<string, Sticker>
  bySubseccion: Map<string, Sticker[]>
  codesBySubseccion: Map<string, Set<string>>
}

/** Singleton: once loaded, reused for the entire session */
let cached: CatalogData | null = null

function buildCatalog(stickers: Sticker[]): CatalogData {
  const indices = buildIndices(stickers)
  return {
    stickers,
    sections: buildSections(stickers),
    ...indices,
  }
}

function loadFromLocalStorage(): Sticker[] | null {
  try {
    const version = localStorage.getItem(CACHE_VERSION_KEY)
    if (version !== CATALOG_VERSION) return null
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StickerRow[]
    if (!Array.isArray(parsed) || parsed.length !== 980) return null
    return parsed.map(rowToSticker)
  } catch {
    return null
  }
}

function saveToLocalStorage(rows: StickerRow[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows))
    localStorage.setItem(CACHE_VERSION_KEY, CATALOG_VERSION)
  } catch { /* localStorage full or unavailable */ }
}

export async function loadCatalog(): Promise<CatalogData> {
  // Return in-memory singleton if already loaded
  if (cached) return cached

  // Try localStorage cache first
  const localStickers = loadFromLocalStorage()
  if (localStickers) {
    cached = buildCatalog(localStickers)
    return cached
  }

  // Fetch from Supabase
  const { data, error } = await supabase
    .from('figuritas')
    .select('*')
    .order('numero_orden', { ascending: true })
    .limit(1000)

  if (error || !data || data.length === 0) {
    throw new Error(`Failed to load sticker catalog: ${error?.message ?? 'empty result'}`)
  }

  const rows = data as StickerRow[]
  saveToLocalStorage(rows)

  const stickers = rows.map(rowToSticker)
  cached = buildCatalog(stickers)
  return cached
}

/** Get the cached catalog synchronously — returns null if not yet loaded */
export function getCatalog(): CatalogData | null {
  return cached
}
