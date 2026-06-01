import { useEffect, useState } from 'react'

export function OfflineNotice() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateOnlineState)
    window.addEventListener('offline', updateOnlineState)
    return () => {
      window.removeEventListener('online', updateOnlineState)
      window.removeEventListener('offline', updateOnlineState)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed inset-x-3 top-[calc(0.75rem+env(safe-area-inset-top))] z-[80] mx-auto max-w-md rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm shadow-xl">
      <p className="font-black text-zinc-900">Estás sin conexión</p>
      <p className="mt-1 font-semibold text-zinc-500">
        Podés seguir viendo la app si ya estaba cargada, pero algunas acciones pueden no estar disponibles.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-3 rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-white"
      >
        Reintentar
      </button>
    </div>
  )
}
