import { useState, useEffect } from 'react'
import { getTradeCandidates } from '@/services/trades.service'
import type { TradeUser, Connection } from '@/types/trade'

export function useTrades(
  _triggerCelebration: (type: 'sticker' | 'achievement' | 'match', msg: string, icon: string) => void
) {
  const [tradeUsers, setTradeUsers] = useState<TradeUser[]>([])
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true)
  const [swipeIndex, setSwipeIndex] = useState(0)
  const [likedByMe, setLikedByMe] = useState<TradeUser[]>([])
  const [likedByThem, setLikedByThem] = useState<TradeUser[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)

  useEffect(() => {
    getTradeCandidates(20).then(({ data }) => {
      setTradeUsers(data.map(c => ({
        id: c.userId,
        name: c.username,
        distance: `${Math.round(c.matchScore)}% compatibilidad`,
        hasForYou: c.theyOfferCount,
        youHaveForThem: c.iOfferCount,
        offers: [],
      })))
      setIsLoadingCandidates(false)
    })
  }, [])

  const handleSwipe = (direction: 'left' | 'right', user: TradeUser) => {
    if (direction === 'right') {
      setLikedByMe(prev => [...prev, user])
    }
    setSwipeIndex(prev => prev + 1)
  }

  const handleAcceptLike = (user: TradeUser) => {
    setConnections(prev => [...prev, { ...user, isNew: true, hasUnread: false }])
    setLikedByThem(prev => prev.filter(u => u.id !== user.id))
    setShowMatchAnimation(true)
    setTimeout(() => setShowMatchAnimation(false), 1500)
  }

  const handleRejectLike = (user: TradeUser) => {
    setLikedByThem(prev => prev.filter(u => u.id !== user.id))
  }

  const markConnectionRead = (userId: string | number) => {
    setConnections(prev => prev.map(c =>
      c.id === userId ? { ...c, isNew: false, hasUnread: false } : c
    ))
  }

  const markConnectionUnread = (userId: string | number) => {
    setConnections(prev => prev.map(c =>
      c.id === userId ? { ...c, hasUnread: true } : c
    ))
  }

  const currentTradeUser = tradeUsers[swipeIndex] ?? null
  const unreadConnectionsCount = connections.filter(c => c.isNew || c.hasUnread).length

  return {
    swipeIndex,
    likedByMe,
    likedByThem,
    connections,
    showMatchAnimation,
    currentTradeUser,
    isLoadingCandidates,
    unreadConnectionsCount,
    handleSwipe,
    handleAcceptLike,
    handleRejectLike,
    markConnectionRead,
    markConnectionUnread,
  }
}
