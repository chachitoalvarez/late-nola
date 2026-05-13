import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { listConnections as listChatConnections, getOrCreateConnection } from '@/services/chat.service'
import {
  getTradeCandidates,
  listSentLikes,
  listReceivedLikes,
  sendTradeLike,
  acceptTradeLike,
  rejectTradeLike,
  getTradeMatch,
} from '@/services/trades.service'
import type { TradeUser, Connection } from '@/types/trade'

function candidateToUser(candidate: {
  userId: string
  username: string
  theyOfferCount: number
  iOfferCount: number
  matchScore: number
}): TradeUser {
  return {
    id: candidate.userId,
    name: candidate.username,
    distance: `${Math.round(candidate.matchScore)}% compatibilidad`,
    hasForYou: candidate.theyOfferCount,
    youHaveForThem: candidate.iOfferCount,
    offers: [],
  }
}

export function useTrades(
  triggerCelebration: (type: 'sticker' | 'achievement' | 'match', msg: string, icon: string) => void
) {
  const { sessionUserId } = useAuth()
  const [tradeUsers, setTradeUsers] = useState<TradeUser[]>([])
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true)
  const [swipeIndex, setSwipeIndex] = useState(0)
  const [likedByMe, setLikedByMe] = useState<TradeUser[]>([])
  const [likedByThem, setLikedByThem] = useState<TradeUser[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)

  const refreshCandidates = useCallback(async () => {
    setIsLoadingCandidates(true)
    const [{ data: candidates }, { data: sent }, { data: received }] = await Promise.all([
      getTradeCandidates(30),
      listSentLikes(),
      listReceivedLikes(),
    ])

    const excluded = new Set([
      ...sent.map(user => String(user.id)),
      ...received.map(user => String(user.id)),
    ])

    setLikedByMe(sent)
    setLikedByThem(received)
    setTradeUsers(candidates.map(candidateToUser).filter(user => !excluded.has(String(user.id))))
    setSwipeIndex(0)
    setIsLoadingCandidates(false)
  }, [])

  const refreshConnections = useCallback(async () => {
    const { data } = await listChatConnections()
    const next = await Promise.all(data.map(async conn => {
      const match = await getTradeMatch(conn.otherUserId)
      return {
        id: conn.otherUserId,
        name: conn.otherUsername,
        distance: conn.lastMessageAt ? 'Chat abierto' : 'Conexión activa',
        hasForYou: match.ok ? match.match.theyOfferCount : 0,
        youHaveForThem: match.ok ? match.match.iOfferCount : 0,
        offers: [],
        isNew: false,
        hasUnread: conn.unreadCount > 0,
      }
    }))
    setConnections(next)
  }, [])

  const refreshTrades = useCallback(async () => {
    await refreshConnections()
    await refreshCandidates()
  }, [refreshConnections, refreshCandidates])

  useEffect(() => {
    if (!sessionUserId) return
    refreshTrades()
  }, [sessionUserId, refreshTrades])

  const handleSwipe = async (direction: 'left' | 'right', user: TradeUser) => {
    setSwipeIndex(prev => prev + 1)

    if (direction === 'right') {
      setLikedByMe(prev => prev.some(item => String(item.id) === String(user.id)) ? prev : [...prev, user])
      const { matched } = await sendTradeLike(user)

      if (matched) {
        await getOrCreateConnection(String(user.id))
        setLikedByMe(prev => prev.filter(item => String(item.id) !== String(user.id)))
        await refreshConnections()
        setShowMatchAnimation(true)
        triggerCelebration('match', `Nuevo match con @${user.name}`, 'heart')
        setTimeout(() => setShowMatchAnimation(false), 1500)
      }
    }
  }

  const handleAcceptLike = async (user: TradeUser) => {
    setLikedByThem(prev => prev.filter(u => String(u.id) !== String(user.id)))
    await acceptTradeLike(user)
    await getOrCreateConnection(String(user.id))
    await refreshConnections()
    setShowMatchAnimation(true)
    triggerCelebration('match', `Nuevo match con @${user.name}`, 'heart')
    setTimeout(() => setShowMatchAnimation(false), 1500)
  }

  const handleRejectLike = async (user: TradeUser) => {
    setLikedByThem(prev => prev.filter(u => String(u.id) !== String(user.id)))
    await rejectTradeLike(user)
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
