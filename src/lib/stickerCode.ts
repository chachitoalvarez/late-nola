import { albumStickers, stickersByCode } from '@/data/albumData'
import type { Sticker } from '@/types/album'

export interface ParsedStickerCode {
  prefix: string
  number: string
  normalizedCode: string
}

export type StickerCodeValidationStatus = 'valid' | 'prefix_invalid' | 'number_invalid' | 'not_found'

export interface StickerCodeValidation {
  status: StickerCodeValidationStatus
  prefix?: string
  number?: string
  normalizedCode?: string
  sticker?: Sticker
}

interface PrefixInfo {
  stickerCount: number
  numbers: Set<number>
}

const prefixIndex = buildPrefixIndex()

function buildPrefixIndex(): Map<string, PrefixInfo> {
  const index = new Map<string, PrefixInfo>()

  for (const sticker of albumStickers) {
    const match = sticker.codigoFigura.match(/^([A-Z]{3})(\d{3})$/)
    if (!match) continue

    const prefix = match[1]
    const number = Number(match[2])
    const current = index.get(prefix) ?? { stickerCount: 0, numbers: new Set<number>() }
    current.stickerCount += 1
    current.numbers.add(number)
    index.set(prefix, current)
  }

  return index
}

export function getStickerPrefixes(): string[] {
  return Array.from(prefixIndex.keys()).sort()
}

export function parseStickerCode(input: string): ParsedStickerCode | null {
  if (!input) return null
  const cleaned = input.trim().toUpperCase().replace(/[\s\-_]/g, '')
  const match = cleaned.match(/^([A-Z]{3})(\d{1,3})$/)
  if (!match) return null

  const prefix = match[1]
  const number = match[2]
  return {
    prefix,
    number,
    normalizedCode: `${prefix}${number.padStart(3, '0')}`,
  }
}

export function normalizeStickerCode(input: string): string | null {
  return parseStickerCode(input)?.normalizedCode ?? null
}

export function validateStickerCode(input: string | ParsedStickerCode): StickerCodeValidation {
  const parsed = typeof input === 'string' ? parseStickerCode(input) : input
  if (!parsed) return { status: 'not_found' }

  const prefixInfo = prefixIndex.get(parsed.prefix)
  if (!prefixInfo) {
    return {
      status: 'prefix_invalid',
      prefix: parsed.prefix,
      number: parsed.number,
      normalizedCode: parsed.normalizedCode,
    }
  }

  const number = Number(parsed.number)
  if (!prefixInfo.numbers.has(number)) {
    return {
      status: 'number_invalid',
      prefix: parsed.prefix,
      number: parsed.number,
      normalizedCode: parsed.normalizedCode,
    }
  }

  const sticker = stickersByCode.get(parsed.normalizedCode)
  if (!sticker) {
    return {
      status: 'not_found',
      prefix: parsed.prefix,
      number: parsed.number,
      normalizedCode: parsed.normalizedCode,
    }
  }

  return {
    status: 'valid',
    prefix: parsed.prefix,
    number: parsed.number,
    normalizedCode: parsed.normalizedCode,
    sticker,
  }
}

