import { useMemo, useState } from 'react'
import { Search, Users, Filter } from 'lucide-react'
import { useContacts } from '@/lib/hooks'
import { timeAgo } from '@/lib/format'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Field'
import { PageHeader, EmptyState } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'

export function Contacts() {
  const { data: contacts = [] } = useContacts()
  const [query, setQuery] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  const allTags = useMemo(
    () => Array.from(new Set(contacts.flatMap((c) => c.tags))).sort(),
    [contacts],
  )

  const filtered = contacts.filter((c) => {
    const q = query.toLowerCase()
    const matchesQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      (c.keyword_used?.toLowerCase().includes(q) ?? false)
    const matchesTag = !tagFilter || c.tags.includes(tagFilter)
    return matchesQuery && matchesTag
  })

  return (
    <div>
      <PageHeader
        title="Contatos"
        description={`${contacts.length} leads capturados pelas suas automações.`}
      />

      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <Input
            placeholder="Buscar por nome, @username ou palavra-chave…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="size-4 shrink-0 text-ink-muted" />
          <button
            onClick={() => setTagFilter(null)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              !tagFilter
                ? 'bg-brand-600 text-white'
                : 'bg-canvas text-ink-soft hover:bg-border',
            )}
          >
            Todas
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTagFilter(t)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                tagFilter === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-canvas text-ink-soft hover:bg-border',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      <Card className="animate-in overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum contato encontrado"
            description="Ajuste a busca ou os filtros para encontrar seus leads."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Contato</th>
                  <th className="px-5 py-3 font-medium">Origem</th>
                  <th className="px-5 py-3 font-medium">Palavra-chave</th>
                  <th className="px-5 py-3 font-medium">Tags</th>
                  <th className="px-5 py-3 font-medium">1ª interação</th>
                  <th className="px-5 py-3 font-medium">Última</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-canvas/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                          {c.name
                            .split(' ')
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join('')}
                        </span>
                        <div>
                          <p className="font-medium text-ink">{c.name}</p>
                          <p className="text-xs text-ink-muted">{c.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">{c.origin}</td>
                    <td className="px-5 py-3.5">
                      {c.keyword_used ? (
                        <Badge tone="brand">{c.keyword_used}</Badge>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <Badge key={t}>{t}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">
                      {timeAgo(c.first_interaction_at)}
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">
                      {timeAgo(c.last_interaction_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
