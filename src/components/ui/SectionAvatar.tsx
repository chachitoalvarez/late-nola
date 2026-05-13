import type { AlbumSection } from '@/types/album'

const AVATAR_BY_CODE: Record<string, string> = {
  PL: '🏆',
  FWC: '🌎',
  MEX: '🇲🇽',
  RSA: '🇿🇦',
  KOR: '🇰🇷',
  CZE: '🇨🇿',
  CAN: '🇨🇦',
  BIH: '🇧🇦',
  QAT: '🇶🇦',
  SUI: '🇨🇭',
  BRA: '🇧🇷',
  MAR: '🇲🇦',
  HAI: '🇭🇹',
  SCO: '🏴',
  USA: '🇺🇸',
  PAR: '🇵🇾',
  AUS: '🇦🇺',
  TUR: '🇹🇷',
  GER: '🇩🇪',
  CUW: '🇨🇼',
  CIV: '🇨🇮',
  ECU: '🇪🇨',
  NED: '🇳🇱',
  JPN: '🇯🇵',
  SWE: '🇸🇪',
  TUN: '🇹🇳',
  BEL: '🇧🇪',
  EGY: '🇪🇬',
  IRN: '🇮🇷',
  NZL: '🇳🇿',
  ESP: '🇪🇸',
  CPV: '🇨🇻',
  KSA: '🇸🇦',
  URU: '🇺🇾',
  FRA: '🇫🇷',
  SEN: '🇸🇳',
  IRQ: '🇮🇶',
  NOR: '🇳🇴',
  ARG: '🇦🇷',
  ALG: '🇩🇿',
  AUT: '🇦🇹',
  JOR: '🇯🇴',
  POR: '🇵🇹',
  COD: '🇨🇩',
  UZB: '🇺🇿',
  COL: '🇨🇴',
  ENG: '🏴',
  CRO: '🇭🇷',
  GHA: '🇬🇭',
  PAN: '🇵🇦',
}

function getSectionAvatar(section: AlbumSection) {
  return AVATAR_BY_CODE[section.codigoBase] ?? section.codigoBase.slice(0, 2)
}

interface Props {
  section: AlbumSection
  size?: 'sm' | 'md'
}

export function SectionAvatar({ section, size = 'sm' }: Props) {
  const sizeClass = size === 'md' ? 'w-10 h-10 text-2xl' : 'w-8 h-8 text-xl'
  const avatar = getSectionAvatar(section)

  return (
    <div
      className={`${sizeClass} rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden`}
      title={section.section}
      aria-label={section.section}
    >
      <span className="leading-none">{avatar}</span>
    </div>
  )
}
