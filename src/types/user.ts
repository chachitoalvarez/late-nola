export interface User {
  id: string | number
  name: string
  email: string
  isMe?: boolean
}

export interface Friend {
  id: number
  name: string
  email: string
  completed: number
  needed: number
  repeated: number
}

export interface LeaderboardEntry extends Omit<Friend, 'id'> {
  id: number | string
  isMe?: boolean
}
