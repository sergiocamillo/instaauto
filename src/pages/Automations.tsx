import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Plus, Workflow } from 'lucide-react'
import {
  useAutomations,
  useToggleAutomation,
  useDeleteAutomation,
} from '@/lib/hooks'
import { ctr } from '@/lib/types'
import { triggerIcon, triggerLabel } from '@/lib/catalog'
import { formatNumber, timeAgo } from '@/lib/format'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { PageHeader, EmptyState } from '@/components/ui/Misc'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ConnectBanner } from '@/components/ConnectBanner'

export function Automations() {
  const navigate = useNavigate()
  const { data: automations = [] } = useAutomations()
  const toggle = useToggleAutomation()
  const del = useDeleteAutomation()
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const target = automations.find((a) => a.id === pendingDelete)

  return (
    <div>
      <PageHeader
        title="Automações"
        description="Gerencie todos os fluxos que respondem por você."
      >
        <Button onClick={() => navigate('/automacoes/nova')}>
          <Plus className="size-4" />
          Criar automação
        </Button>
      </PageHeader>

      <ConnectBanner />

      <Card className="animate-in overflow-hidden">
        {automations.length === 0 ? (
          <EmptyState
            icon={Workflow}
            title="Nenhuma automação ainda"
            description="Crie sua primeira automação para começar a responder comentários e DMs automaticamente."
            action={
              <Button onClick={() => navigate('/automacoes/nova')}>
                <Plus className="size-4" />
                Criar automação
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Automação</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Execuções</th>
                  <th className="px-5 py-3 text-right font-medium">CTR</th>
                  <th className="px-5 py-3 font-medium">Última execução</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {automations.map((a) => {
                  const Icon = triggerIcon(a.trigger.type)
                  const active = a.status === 'active'
                  return (
                    <tr key={a.id} className="group hover:bg-canvas/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                            <Icon className="size-[18px]" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/automacoes/nova?edit=${a.id}`}
                              className="block truncate font-medium text-ink hover:text-brand-700"
                            >
                              {a.name}
                            </Link>
                            <p className="truncate text-xs text-ink-muted">
                              {triggerLabel(a.trigger.type)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <Switch
                            checked={active}
                            onChange={() =>
                              toggle.mutate({
                                id: a.id,
                                status: active ? 'inactive' : 'active',
                              })
                            }
                            label={`Ativar ${a.name}`}
                          />
                          <span
                            className={
                              active
                                ? 'text-xs font-medium text-success'
                                : 'text-xs text-ink-muted'
                            }
                          >
                            {active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-ink">
                        {formatNumber(a.executions)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Badge tone={ctr(a) >= 40 ? 'success' : 'neutral'}>
                          {ctr(a)}%
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-ink-soft">
                        {timeAgo(a.last_run_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/automacoes/nova?edit=${a.id}`)
                            }
                            aria-label="Editar"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPendingDelete(a.id)}
                            aria-label="Excluir"
                            className="text-ink-soft hover:text-danger"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir automação"
        description={`Tem certeza que deseja excluir "${target?.name}"? Esta ação não pode ser desfeita.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) del.mutate(pendingDelete)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
