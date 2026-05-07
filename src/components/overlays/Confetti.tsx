const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6']

export function Confetti() {
  const pieces = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}vw`,
    animationDelay: `${Math.random() * 0.5}s`,
    backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: `${Math.random() * 8 + 6}px`,
    height: `${Math.random() * 12 + 8}px`,
    rotation: `${Math.random() * 360}deg`,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-[110] overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute -top-10 rounded-sm"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            backgroundColor: p.backgroundColor,
            animation: 'confettiFall 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
            animationDelay: p.animationDelay,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  )
}
