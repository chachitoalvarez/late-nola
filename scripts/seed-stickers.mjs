/**
 * Seed script: loads panini_mundial_2026_980_limpio.json into the Supabase stickers table.
 *
 * Usage:
 *   node scripts/seed-stickers.mjs
 *
 * Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * (service role key, NOT the anon key — anon can't write to stickers)
 *
 * Set them in .env or pass inline:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-stickers.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.')
  console.error('Usage: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-stickers.mjs')
  process.exit(1)
}

const supabase = createClient(url, key)

const jsonPath = resolve(__dirname, '../src/data/panini_mundial_2026_980_limpio.json')
const raw = JSON.parse(readFileSync(jsonPath, 'utf-8'))
const figuritas = raw.figuritas

console.log(`Loaded ${figuritas.length} stickers from JSON`)

// Transform to DB rows
const rows = figuritas.map(f => ({
  id: `wc2026:base:${f.codigo_figura}`,
  numero_orden: f.numero_orden,
  seccion: f.seccion,
  subseccion: f.subseccion,
  codigo_figura: f.codigo_figura,
  pais_equipo: f.pais_equipo,
  nombre_figura: f.nombre_figura,
  nombre_jugador: f.nombre_jugador,
  tipo_figura: f.tipo_figura,
  tipo_coleccion: f.tipo_coleccion,
  es_especial: f.es_especial,
  acabado: f.acabado,
}))

// Upsert in batches of 200
const BATCH_SIZE = 200
let inserted = 0

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE)
  const { error } = await supabase
    .from('stickers')
    .upsert(batch, { onConflict: 'id' })

  if (error) {
    console.error(`Error at batch ${i / BATCH_SIZE + 1}:`, error.message)
    process.exit(1)
  }

  inserted += batch.length
  console.log(`  Upserted ${inserted} / ${rows.length}`)
}

console.log(`\n✅ Done. ${inserted} stickers seeded into Supabase.`)
