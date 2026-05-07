import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { Tab, IntercambiosTab } from '@/lib/constants'
import type { LeaderboardEntry } from '@/types/user'

interface UIContextValue {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  intercambiosTab: IntercambiosTab
  setIntercambiosTab: (tab: IntercambiosTab) => void
  isProfileOpen: boolean
  setIsProfileOpen: (v: boolean) => void
  selectedPublicUser: LeaderboardEntry | null
  setSelectedPublicUser: (user: LeaderboardEntry | null) => void
  resetUI: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  const [activeTab, setActiveTab] = useState<Tab>('resumen')
  const [intercambiosTab, setIntercambiosTab] = useState<IntercambiosTab>('explorar')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedPublicUser, setSelectedPublicUser] = useState<LeaderboardEntry | null>(null)

  const resetUI = useCallback(() => {
    setActiveTab('resumen')
    setIntercambiosTab('explorar')
    setIsProfileOpen(false)
    setSelectedPublicUser(null)
  }, [])

  // Fires on every transition to authenticated (login + session restore on reload)
  useEffect(() => {
    if (isAuthenticated) resetUI()
  }, [isAuthenticated, resetUI])

  return (
    <UIContext.Provider value={{
      activeTab, setActiveTab,
      intercambiosTab, setIntercambiosTab,
      isProfileOpen, setIsProfileOpen,
      selectedPublicUser, setSelectedPublicUser,
      resetUI,
    }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
