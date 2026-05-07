# Tracker Mundial 2026

Gestor de álbum de figuritas del Mundial 2026. Controlá tu colección, comparate con amigos e intercambiá repetidas.

## Stack

- Vite + React 19 + TypeScript (strict)
- Tailwind CSS v3 + tailwindcss-animate
- lucide-react, clsx, tailwind-merge
- Persistencia local vía `localStorage`
- Supabase (scaffolding preparado, sin integración activa)

## Cómo correr

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/
npm run preview  # sirve el build local
```

## Estructura

```
src/
├── types/          # Interfaces TypeScript (album, user, trade, chat, group, achievement)
├── data/           # Mocks estáticos (albumData, mockFriends, mockTradeUsers, mockGroups)
├── lib/            # Utilidades puras (cn, stats, icons, constants)
├── hooks/          # Hooks de dominio (useAlbum, useTrades, useChat, useGroups, ...)
├── contexts/       # React contexts (AuthContext, UIContext)
├── services/       # Stubs Supabase (album, auth, trades, groups)
├── components/     # Componentes reutilizables (ui/, layout/, drawers/, overlays/)
├── features/       # Componentes por dominio (resumen/, detalle/, comparar/, ...)
└── views/          # Vistas de cada tab (ResumenView, DetalleView, CompararView, ...)
```

## Conectar Supabase (4 pasos)

1. Crear un proyecto en [supabase.com](https://supabase.com) y copiar la URL y la anon key.
2. Crear `.env.local` en esta carpeta con:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```
3. Instalar el cliente: `npm install @supabase/supabase-js`
4. Descomentar y completar las implementaciones reales en `src/services/supabase.ts` y los demás archivos en `src/services/`.
