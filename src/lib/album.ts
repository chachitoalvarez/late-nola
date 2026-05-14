import { stickersBySubseccion, albumStickers } from '@/data/albumData'
import type { Sticker } from '@/types/album'
export { normalizeStickerCode, parseStickerCode, validateStickerCode } from '@/lib/stickerCode'
import { validateStickerCode } from '@/lib/stickerCode'

interface PlayerInfo {
  number: number
  name: string
  role?: 'captain' | 'coach' | 'special'
}

export function findStickerByCode(input: string): Sticker | null {
  const validation = validateStickerCode(input)
  return validation.status === 'valid' ? validation.sticker ?? null : null
}

export function getStickerByCanonicalCode(code: string): Sticker | null {
  return albumStickers.find(sticker => sticker.codigoFigura === code) ?? null
}

/**
 * Devuelve el ID legible para mostrar en la UI (sin padding).
 * Útil para chips: "ARG001" → "ARG1", "FWC008" → "FWC8".
 * Si querés el canónico (con padding), usá sticker.codigoFigura directamente.
 */
export function formatStickerDisplayId(codigoFigura: string): string {
  const match = codigoFigura.match(/^([A-Z]+)(\d+)$/)
  if (!match) return codigoFigura
  const [, prefix, num] = match
  return `${prefix}${parseInt(num, 10)}`
}

/**
 * Búsqueda libre: por código, alias, nombre del jugador, o país/equipo.
 * Devuelve sticker matches ordenados por relevancia simple.
 */
export function searchStickers(query: string): Sticker[] {
  if (!query.trim()) return []
  const q = query.trim().toLowerCase()

  // Si parece un código, intentar matchear exacto primero
  const codeMatch = findStickerByCode(query)
  if (codeMatch) return [codeMatch]

  // Si no, búsqueda libre por nombre o país
  return albumStickers.filter(s =>
    s.nombreFigura.toLowerCase().includes(q) ||
    s.paisEquipo.toLowerCase().includes(q) ||
    s.subseccion.toLowerCase().includes(q)
  ).slice(0, 50) // limitar resultados
}

export function describeStickerCode(code: string): string {
  const sticker = getStickerByCanonicalCode(code)
  if (!sticker) return code
  return `${formatStickerDisplayId(code)} de ${sticker.subseccion}`
}

export function getPlayerInfo(section: string, number: number): PlayerInfo | null {
  const sticker = stickersBySubseccion.get(section)?.[number - 1]
  if (!sticker) return null

  return {
    number,
    name: sticker.nombreFigura || sticker.codigoAlias || `Figurita ${number}`,
    role: sticker.tipoFigura === 'especial' ? 'special' : undefined,
  }
}
