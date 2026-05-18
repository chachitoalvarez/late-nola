import { User } from 'lucide-react'
import { getAvatarUrl } from '@/lib/avatars'

interface Props {
  avatarKey?: string | null
  className?: string
  iconClassName?: string
  fallbackClassName?: string
}

export function UserAvatar({
  avatarKey,
  className = 'h-10 w-10',
  iconClassName = 'h-5 w-5',
  fallbackClassName = 'bg-zinc-100 text-zinc-400',
}: Props) {
  const avatarUrl = getAvatarUrl(avatarKey)

  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className={`${className} rounded-full object-cover`} />
  }

  return (
    <div className={`${className} ${fallbackClassName} rounded-full flex items-center justify-center`}>
      <User className={iconClassName} />
    </div>
  )
}
