import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: Props) {
  return (
    <div className="p-12 text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-zinc-800 text-lg">{title}</h3>
      {description && <p className="text-zinc-500 text-sm mt-1">{description}</p>}
    </div>
  )
}
