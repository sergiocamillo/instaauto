import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={onOpenSidebar}
        className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-canvas lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden max-w-sm flex-1 items-center sm:flex">
        <Search className="pointer-events-none absolute left-3 size-4 text-ink-muted" />
        <input
          placeholder="Buscar contatos, automações…"
          className="h-9 w-full rounded-lg border border-border bg-canvas pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" onClick={() => navigate('/automacoes/nova')}>
          Nova automação
        </Button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-canvas"
          >
            <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {user ? initials(user.name) : '··'}
            </span>
            <ChevronDown className="size-4 text-ink-muted" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-pop)]">
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-medium text-ink">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-ink-muted">{user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-canvas"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
