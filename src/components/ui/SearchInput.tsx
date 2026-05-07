import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...', className = '' }: Props) {
  return (
    <div className={`relative w-full md:w-80 ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-zinc-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-zinc-200/60 rounded-2xl leading-5 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all font-medium shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
