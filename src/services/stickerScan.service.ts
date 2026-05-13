import Tesseract from 'tesseract.js'
import { albumStickers } from '@/data/albumData'
import { findStickerByCode, getStickerByCanonicalCode } from '@/lib/album'
import type { Sticker } from '@/types/album'

export interface DetectedSticker {
  id: string
  code: string
  quantity: number
  status: 'detected' | 'needs_review'
  sticker?: Sticker
  rawText?: string
  confidence?: number
}

export type ScanMockMode = 'normal' | 'empty' | 'too_many'

interface OcrWord {
  text: string
  confidence: number
}

interface PageLike {
  text?: string
  confidence?: number
  words?: OcrWord[]
  blocks?: Array<{ paragraphs?: Array<{ lines?: Array<{ words?: OcrWord[] }> }> }> | null
}

interface CapsuleCrop {
  source: HTMLCanvasElement
  approximate: { x: number; y: number; width: number; height: number }
  capsule: { x: number; y: number; width: number; height: number }
  crop: HTMLCanvasElement
  ocr: HTMLCanvasElement
}

interface OcrAttempt {
  psm: Tesseract.PSM
  rawText: string
  confidence: number
  words: OcrWord[]
  candidate: DetectedSticker | null
}

const OCR_TIMEOUT_MS = 45000
const CODE_REGEX = /\b([A-Z]{3})\s?(\d{1,3})\b/g
const DETECTED_CONFIDENCE_THRESHOLD = 90

function prefixExists(prefix: string): boolean {
  return albumStickers.some(sticker => sticker.codigoFigura.startsWith(prefix))
}

function normalizeOcrCandidate(prefix: string, number: string): string {
  return `${prefix.toUpperCase()}${number.padStart(3, '0')}`
}

function getWords(page: PageLike): OcrWord[] {
  if (Array.isArray(page.words)) return page.words

  const words: OcrWord[] = []
  for (const block of page.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        words.push(...(line.words ?? []))
      }
    }
  }
  return words
}

function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

function debugCrop(crop: CapsuleCrop) {
  if (!import.meta.env.DEV) return

  console.groupCollapsed('[Sticker OCR] capsule crop')
  console.log('original:', canvasToDataUrl(crop.source))
  console.log('approximate top-right region:', crop.approximate)
  console.log('detected capsule:', crop.capsule)
  console.log('crop size:', { width: crop.crop.width, height: crop.crop.height })
  console.log('crop:', canvasToDataUrl(crop.crop))
  console.log('ocr input:', canvasToDataUrl(crop.ocr))
  console.groupEnd()
}

function debugOcr(attempts: OcrAttempt[], final: DetectedSticker[]) {
  if (!import.meta.env.DEV) return

  console.groupCollapsed('[Sticker OCR] code attempts')
  for (const attempt of attempts) {
    console.groupCollapsed(`PSM ${attempt.psm}`)
    console.log('rawText:', attempt.rawText)
    console.log('pageConfidence:', attempt.confidence)
    console.table(attempt.words.map(word => ({ text: word.text, confidence: word.confidence })))
    console.log('candidate:', attempt.candidate)
    console.groupEnd()
  }
  console.log('final:', final)
  console.groupEnd()
}

export function extractStickerCodesFromText(text: string, confidence = 0): DetectedSticker[] {
  const matches = Array.from(text.toUpperCase().matchAll(CODE_REGEX))
  const grouped = new Map<string, DetectedSticker>()

  for (const match of matches) {
    const rawText = match[0]
    const prefix = match[1].toUpperCase()
    const code = normalizeOcrCandidate(prefix, match[2])
    if (!prefixExists(prefix)) continue

    const sticker = getStickerByCanonicalCode(code)
    const current = grouped.get(code)
    grouped.set(code, {
      id: current?.id ?? code,
      code,
      quantity: (current?.quantity ?? 0) + 1,
      status: sticker && confidence >= DETECTED_CONFIDENCE_THRESHOLD ? 'detected' : 'needs_review',
      sticker: sticker ?? current?.sticker,
      rawText: current?.rawText ? `${current.rawText}, ${rawText}` : rawText,
      confidence: Math.max(current?.confidence ?? 0, confidence),
    })
  }

  return Array.from(grouped.values())
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('OCR timeout')), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function imageToCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.drawImage(image, 0, 0)
  return canvas
}

function findDarkCapsule(source: HTMLCanvasElement): CapsuleCrop | null {
  const approx = {
    x: Math.round(source.width * 0.55),
    y: Math.round(source.height * 0.06),
    width: Math.round(source.width * 0.4),
    height: Math.round(source.height * 0.16),
  }

  const ctx = source.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const data = ctx.getImageData(approx.x, approx.y, approx.width, approx.height)
  const visited = new Uint8Array(approx.width * approx.height)
  const isDark = (x: number, y: number) => {
    const index = (y * approx.width + x) * 4
    const r = data.data[index]
    const g = data.data[index + 1]
    const b = data.data[index + 2]
    return (r + g + b) / 3 < 85
  }

  let best: { x0: number; y0: number; x1: number; y1: number; area: number } | null = null
  const queue: Array<[number, number]> = []

  for (let y = 0; y < approx.height; y += 1) {
    for (let x = 0; x < approx.width; x += 1) {
      const startIndex = y * approx.width + x
      if (visited[startIndex] || !isDark(x, y)) continue

      visited[startIndex] = 1
      queue.length = 0
      queue.push([x, y])
      let head = 0
      let x0 = x
      let x1 = x
      let y0 = y
      let y1 = y
      let area = 0

      while (head < queue.length) {
        const [cx, cy] = queue[head]
        head += 1
        area += 1
        x0 = Math.min(x0, cx)
        x1 = Math.max(x1, cx)
        y0 = Math.min(y0, cy)
        y1 = Math.max(y1, cy)

        for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
          if (nx < 0 || ny < 0 || nx >= approx.width || ny >= approx.height) continue
          const nIndex = ny * approx.width + nx
          if (visited[nIndex] || !isDark(nx, ny)) continue
          visited[nIndex] = 1
          queue.push([nx, ny])
        }
      }

      const width = x1 - x0 + 1
      const height = y1 - y0 + 1
      const horizontalRatio = width / Math.max(height, 1)
      if (area > 80 && horizontalRatio > 2 && width > approx.width * 0.18) {
        if (!best || area > best.area) best = { x0, y0, x1, y1, area }
      }
    }
  }

  if (!best) return null

  const padding = Math.round(Math.min(source.width, source.height) * 0.012)
  const capsule = {
    x: Math.max(0, approx.x + best.x0 - padding),
    y: Math.max(0, approx.y + best.y0 - padding),
    width: Math.min(source.width - (approx.x + best.x0 - padding), best.x1 - best.x0 + 1 + padding * 2),
    height: Math.min(source.height - (approx.y + best.y0 - padding), best.y1 - best.y0 + 1 + padding * 2),
  }

  if (capsule.width < 40 || capsule.height < 16) return null

  const crop = document.createElement('canvas')
  crop.width = capsule.width
  crop.height = capsule.height
  const cropCtx = crop.getContext('2d')
  if (!cropCtx) return null
  cropCtx.drawImage(source, capsule.x, capsule.y, capsule.width, capsule.height, 0, 0, capsule.width, capsule.height)

  const ocr = preprocessCapsuleForOcr(crop)
  return { source, approximate: approx, capsule, crop, ocr }
}

function preprocessCapsuleForOcr(crop: HTMLCanvasElement): HTMLCanvasElement {
  const scale = 5
  const padding = 18
  const canvas = document.createElement('canvas')
  canvas.width = crop.width * scale + padding * 2
  canvas.height = crop.height * scale + padding * 2
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return canvas

  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(crop, padding, padding, crop.width * scale, crop.height * scale)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    const inverted = 255 - gray
    const contrasted = Math.max(0, Math.min(255, (inverted - 128) * 1.9 + 128))
    const value = contrasted > 135 ? 255 : 0
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

async function runCapsuleOcr(file: File): Promise<DetectedSticker[]> {
  const image = await fileToImage(file)
  const source = imageToCanvas(image)
  const crop = findDarkCapsule(source)
  if (!crop) return []

  debugCrop(crop)

  const worker = await Tesseract.createWorker('eng')
  try {
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      load_system_dawg: '0',
      load_freq_dawg: '0',
      preserve_interword_spaces: '1',
    })

    const attempts: OcrAttempt[] = []
    for (const psm of [Tesseract.PSM.SINGLE_LINE, Tesseract.PSM.SINGLE_WORD, Tesseract.PSM.RAW_LINE]) {
      await worker.setParameters({ tessedit_pageseg_mode: psm })
      const result = await withTimeout(worker.recognize(crop.ocr), OCR_TIMEOUT_MS)
      const page = result.data as PageLike
      const rawText = page.text ?? ''
      const confidence = page.confidence ?? 0
      const words = getWords(page)
      const candidate = extractStickerCodesFromText(rawText, confidence)[0] ?? null
      attempts.push({ psm, rawText, confidence, words, candidate })
    }

    const final = selectSingleCandidate(attempts)
    debugOcr(attempts, final)
    return final
  } finally {
    await worker.terminate()
  }
}

function selectSingleCandidate(attempts: OcrAttempt[]): DetectedSticker[] {
  const candidates = attempts.map(attempt => attempt.candidate).filter((item): item is DetectedSticker => !!item)
  if (!candidates.length) return []

  const byCode = new Map<string, DetectedSticker[]>()
  for (const candidate of candidates) {
    byCode.set(candidate.code, [...(byCode.get(candidate.code) ?? []), candidate])
  }

  const [code, appearances] = [...byCode.entries()].sort(([, a], [, b]) => {
    const confidenceDelta = Math.max(...b.map(item => item.confidence ?? 0)) - Math.max(...a.map(item => item.confidence ?? 0))
    return b.length - a.length || confidenceDelta
  })[0]

  const maxConfidence = Math.max(...appearances.map(item => item.confidence ?? 0))
  const sticker = getStickerByCanonicalCode(code)
  const agreementCount = appearances.length
  const isReliable = !!sticker && maxConfidence >= DETECTED_CONFIDENCE_THRESHOLD && agreementCount >= 2

  return [{
    id: code,
    code,
    quantity: 1,
    status: isReliable ? 'detected' : 'needs_review',
    sticker: sticker ?? appearances[0].sticker,
    rawText: appearances.map(item => item.rawText).filter(Boolean).join(', '),
    confidence: maxConfidence || undefined,
  }]
}

function mockDetectStickersFromPhoto(file: File, mode: ScanMockMode = 'normal'): DetectedSticker[] {
  if (mode === 'empty' || file.name.toLowerCase().includes('empty')) return []

  if (mode === 'too_many' || file.name.toLowerCase().includes('many')) {
    return albumStickers.slice(0, 11).map(sticker => ({
      id: sticker.codigoFigura,
      code: sticker.codigoFigura,
      quantity: 1,
      status: 'detected',
      sticker,
      rawText: sticker.codigoAlias,
      confidence: 100,
    }))
  }

  const sticker = findStickerByCode(file.name)
  if (!sticker) return []

  return [{
    id: sticker.codigoFigura,
    code: sticker.codigoFigura,
    quantity: 1,
    status: 'detected',
    sticker,
    rawText: sticker.codigoAlias,
    confidence: 100,
  }]
}

export async function detectStickersFromPhoto(file: File): Promise<DetectedSticker[]> {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_SCAN_MOCK === 'true') {
    return mockDetectStickersFromPhoto(file)
  }

  // MVP: one sticker per photo. OCR runs only on the detected top-right code capsule.
  return runCapsuleOcr(file)
}
