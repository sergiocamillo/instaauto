import { Link } from 'react-router-dom'
import {
  Workflow,
  Send,
  MessageCircle,
  Users,
  ArrowRight,
} from 'lucide-react'
import { useAutomations, useDashboard } from '@/lib/hooks'
import { ctr } from '@/lib/types'
import { triggerIcon, triggerLabel } from '@/lib/catalog'
import { timeAgo, formatNumber } from '@/lib/format'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/Misc'
import { StatCard } from '@/features/dashboard/StatCard'
import { InteractionsChart } from '@/features/dashboard/InteractionsChart'
import { ConnectBanner } from '@/components/ConnectBanner'
import { useAuth } from '@/lib/auth'

export function Dashboard() {
  const { user } = useAuth()
  const { data: dashboard } = useDashboard()
  const { data: automations = [] } = useAutomations()

  const stats = dashboard?.stats ?? {
    activeAutomations: 0,
    messagesSent: 0,
    commentsCaptured: 0,
    leads: 0,
  }
  const analytics = dashboard?.series ?? []

  const recent = [...automations]
    .filter((a) => a.last_run_at)
    .sort(
      (a, b) =>
        new Date(b.last_run_at!).getTime() -
        new Date(a.last_run_at!).getTime(),
    )
    .slice(0, 5)

  return (
    <div>
      <PageHeader
        title={`Olá, ${user?.name?.split(' ')[0] ?? 'tudo bem'} 👋`}
        description="Aqui está o resumo das suas automações dos últimos 7 dias."
      />

      <ConnectBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Automações ativas"
          value={stats.activeAutomations}
          icon={Workflow}
          accent="brand"
          delta={12}
        />
        <StatCard
          index={1}
          label="Mensagens enviadas"
          value={stats.messagesSent}
          icon={Send}
          accent="violet"
          delta={8}
        />
        <StatCard
          index={2}
          label="Comentários capturados"
          value={stats.commentsCaptured}
          icon={MessageCircle}
          accent="success"
          delta={23}
        />
        <StatCard
          index={3}
          label="Leads gerados"
          value={stats.leads}
          icon={Users}
          accent="warning"
          delta={-4}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="animate-in xl:col-span-2" style={{ animationDelay: '240ms' }}>
          <CardHeader>
            <CardTitle>Interações dos últimos 7 dias</CardTitle>
            <div className="flex items-center gap-4 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand-500" />
                Interações
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-violet" />
                Mensagens
              </span>
            </div>
          </CardHeader>
          <div className="p-4">
            <InteractionsChart data={analytics} />
          </div>
        </Card>

        <Card className="animate-in" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Últimas execuções</CardTitle>
            <Link
              to="/automacoes"
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Ver todas <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <ul className="divide-y divide-border">
            {recent.map((a) => {
              const Icon = triggerIcon(a.trigger.type)
              return (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-canvas text-ink-soft">
                    <Icon className="size-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {a.name}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {triggerLabel(a.trigger.type)} · {timeAgo(a.last_run_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">
                      {formatNumber(a.executions)}
                    </p>
                    <p className="text-xs text-ink-muted">{ctr(a)}% CTR</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 animate-in" style={{ animationDelay: '360ms' }}>
        <CardHeader>
          <CardTitle>Suas automações</CardTitle>
        </CardHeader>
        <ul className="divide-y divide-border">
          {automations.slice(0, 4).map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <StatusBadge active={a.status === 'active'} />
                <span className="truncate text-sm font-medium text-ink">
                  {a.name}
                </span>
              </div>
              <span className="text-xs text-ink-muted">
                {formatNumber(a.executions)} execuções
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
