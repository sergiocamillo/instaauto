import { useState } from 'react'
import { MessagesSquare } from 'lucide-react'
import { useMessages } from '@/lib/hooks'
import type { MessageStatus } from '@/lib/types'
import { formatDateTime } from '@/lib/format'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageHeader, EmptyState } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'

const statusMeta: Record<
  MessageStatus,
  { label: string; tone: 'success' | 'brand' | 'danger' | 'warning' }
> = {
  delivered: { label: 'Entregue', tone: 'success' },
  sent: { label: 'Enviada', tone: 'brand' },
  pending: { label: 'Pendente', tone: 'warning' },
  failed: { label: 'Falhou', tone: 'danger' },
}

const FILTERS: Array<{ value: MessageStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'sent', label: 'Enviadas' },
  { value: 'failed', label: 'Falhas' },
]

export function Messages() {
  const [filter, setFilter] = useState<MessageStatus | 'all'>('all')
  const { data: messages = [] } = useMessages(
    filter === 'all' ? undefined : filter,
  )

  const filtered = [...messages].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return (
    <div>
      <PageHeader
        title="Mensagens"
        description="Histórico de tudo que suas automações enviaram."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-brand-600 text-white'
                : 'bg-surface text-ink-soft ring-1 ring-border hover:bg-canvas',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="animate-in overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="Sem mensagens"
            description="Quando suas automações dispararem, as mensagens enviadas aparecerão aqui."
          />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((m) => {
              const meta = statusMeta[m.status]
              return (
                <li key={m.id} className="flex gap-4 px-5 py-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                    {m.contact_name
                      .split(' ')
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-medium text-ink">
                        {m.contact_name}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {m.contact_username}
                      </span>
                      <Badge tone="violet">{m.automation_name}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                      {m.body}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <span className="text-xs text-ink-muted">
                      {formatDateTime(m.created_at)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
