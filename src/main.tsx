import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initCatalogFromSupabase } from '@/data/albumData'

// Start fetching the sticker catalog from Supabase (or localStorage cache).
// The app renders immediately with bundled JSON; this replaces it in the background.
initCatalogFromSupabase()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
