import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Workflow,
  PlusCircle,
  Users,
  MessagesSquare,
  FolderClosed,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Highlight the create-automation entry as a primary CTA. */
  cta?: boolean
}

const items: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/automacoes', label: 'Automações', icon: Workflow },
  { to: '/automacoes/nova', label: 'Criar Automação', icon: PlusCircle, cta: true },
  { to: '/contatos', label: 'Contatos', icon: Users },
  { to: '/mensagens', label: 'Mensagens', icon: MessagesSquare },
  { to: '/arquivos', label: 'Arquivos', icon: FolderClosed },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                item.cta && !isActive
                  ? 'text-brand-700 hover:bg-brand-50'
                  : isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-soft hover:bg-canvas hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'size-[18px] shrink-0',
                    item.cta && !isActive && 'text-brand-600',
                  )}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-lg bg-canvas px-3 py-2.5 text-xs text-ink-muted">
          <span className="font-medium text-ink-soft">Modo protótipo</span>
          <br />
          Dados simulados · Meta API ainda não conectada.
        </div>
      </div>
    </aside>
  )
}
