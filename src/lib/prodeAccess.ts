export type ProdeAccessMode = 'allowlist' | 'all' | 'off'

interface ProdeAccessInput {
  userId?: string | null
  email?: string | null
  username?: string | null
}

const DEFAULT_OWNER_USERNAMES = ['chacho', 'chachitoalvarez']

function splitList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean)
}

export function getProdeAccessMode(): ProdeAccessMode {
  const mode = String(import.meta.env.VITE_PRODE_ACCESS_MODE ?? 'allowlist').trim().toLowerCase()
  if (mode === 'all' || mode === 'off') return mode
  return 'allowlist'
}

export function canAccessProde({ userId, email, username }: ProdeAccessInput): boolean {
  const mode = getProdeAccessMode()
  if (mode === 'all') return true
  if (mode === 'off') return false

  const allowedEmails = splitList(import.meta.env.VITE_PRODE_ALLOWED_EMAILS)
  const allowedUserIds = splitList(import.meta.env.VITE_PRODE_ALLOWED_USER_IDS)
  const allowedUsernames = [
    ...DEFAULT_OWNER_USERNAMES,
    ...splitList(import.meta.env.VITE_PRODE_ALLOWED_USERNAMES),
  ]

  const normalizedEmail = email?.trim().toLowerCase() ?? ''
  const normalizedUserId = userId?.trim().toLowerCase() ?? ''
  const normalizedUsername = username?.trim().toLowerCase().replace(/^@/, '') ?? ''

  return (
    (normalizedEmail !== '' && allowedEmails.includes(normalizedEmail)) ||
    (normalizedUserId !== '' && allowedUserIds.includes(normalizedUserId)) ||
    (normalizedUsername !== '' && allowedUsernames.includes(normalizedUsername))
  )
}
