import { useState } from 'react'
import { mockTradeUsers, initialLikedByThem } from '@/data/mockTradeUsers'
import type { TradeUser, Connection } from '@/types/trade'

export function useTrades(
  _triggerCelebration: (type: 'sticker' | 'achievement' | 'match', msg: string, icon: string) => void
) {
  const [swipeIndex, setSwipeIndex] = useState(0)
  const [likedByMe, setLikedByMe] = useState<TradeUser[]>([])
  const [likedByThem, setLikedByThem] = useState<TradeUser[]>(initialLikedByThem)
  const [connections, setConnections] = useState<Connection[]>([])
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)

  const handleSwipe = (direction: 'left' | 'right', user: TradeUser) => {
    if (direction === 'right') {
      const isInstantMatch = user.id % 2 !== 0
      if (isInstantMatch) {
        setConnections(prev => [...prev, { ...user, isNew: true, hasUnread: false }])
        setShowMatchAnimation(true)
        setTimeout(() => {
          setShowMatchAnimation(false)
          setSwipeIndex(prev => prev + 1)
        }, 1500)
      } else {
        setLikedByMe(prev => [...prev, user])
        setSwipeIndex(prev => prev + 1)
      }
    } else {
      setSwipeIndex(prev => prev + 1)
    }
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

  const markConnectionRead = (userId: number) => {
    setConnections(prev => prev.map(c =>
      c.id === userId ? { ...c, isNew: false, hasUnread: false } : c
    ))
  }

  const markConnectionUnread = (userId: number) => {
    setConnections(prev => prev.map(c =>
      c.id === userId ? { ...c, hasUnread: true } : c
    ))
  }

  const currentTradeUser = swipeIndex < mockTradeUsers.length ? mockTradeUsers[swipeIndex] : null
  const unreadConnectionsCount = connections.filter(c => c.isNew || c.hasUnread).length

  return {
    swipeIndex,
    likedByMe,
    likedByThem,
    connections,
    showMatchAnimation,
    currentTradeUser,
    unreadConnectionsCount,
    handleSwipe,
    handleAcceptLike,
    handleRejectLike,
    markConnectionRead,
    markConnectionUnread,
  }
}
