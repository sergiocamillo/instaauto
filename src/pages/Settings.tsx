import { useState } from 'react'
import { Copy, Check, ShieldCheck, Lock } from 'lucide-react'
import { InstagramGlyph, FacebookGlyph } from '@/components/icons/Brand'
import {
  useAccounts,
  useConnectAccount,
  useDisconnectAccount,
} from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Field'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/Misc'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'
const WEBHOOK_URL = `${API_URL}/webhooks/meta`

export function Settings() {
  const { data: accounts = [] } = useAccounts()
  const connect = useConnectAccount()
  const disconnect = useDisconnectAccount()
  const [copied, setCopied] = useState<string | null>(null)

  function copy(value: string, key: string) {
    navigator.clipboard?.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(null), 1600)
  }

  const igAccount = accounts.find((a) => a.platform === 'instagram')
  const fbAccount = accounts.find((a) => a.platform === 'facebook')
  const igConnected = igAccount?.status === 'connected'
  const fbConnected = fbAccount?.status === 'connected'

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Conecte sua conta do Instagram e gerencie o webhook da Meta."
      />

      <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
        <strong className="font-semibold">Integração Meta.</strong> Conectar o
        Instagram abre o consentimento oficial da Meta. O token é armazenado
        cifrado no servidor e nunca chega ao navegador.
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Connected accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Contas conectadas</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <AccountRow
              icon={
                <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white">
                  <InstagramGlyph className="size-5" />
                </span>
              }
              name="Instagram"
              hint="Creator/Business sem Página"
              handle={igAccount?.handle ?? ''}
              connected={igConnected}
              onToggle={() =>
                igConnected
                  ? disconnect.mutate('instagram')
                  : connect.mutate('instagram')
              }
            />
            <AccountRow
              icon={
                <span className="grid size-10 place-items-center rounded-xl bg-[#1877f2] text-white">
                  <FacebookGlyph className="size-5" />
                </span>
              }
              name="Facebook"
              hint="Business com Página vinculada"
              handle={fbAccount?.handle ?? ''}
              connected={fbConnected}
              onToggle={() =>
                fbConnected
                  ? disconnect.mutate('facebook')
                  : connect.mutate('facebook')
              }
            />
          </CardBody>
        </Card>

        {/* Connection status */}
        <Card>
          <CardHeader>
            <CardTitle>Status da conexão</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-3 rounded-xl bg-canvas p-4">
              <span className="grid size-11 place-items-center rounded-full bg-success-soft text-success">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  {igConnected ? 'Webhook ativo' : 'Aguardando conexão'}
                </p>
                <p className="text-xs text-ink-soft">
                  {igConnected
                    ? 'Recebendo eventos de comentários e DMs.'
                    : 'Conecte o Instagram para começar a receber eventos.'}
                </p>
              </div>
              <Badge tone={igConnected ? 'success' : 'neutral'} className="ml-auto">
                {igConnected ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Configure esta URL de webhook no painel do seu app Meta, usando o
              mesmo token de verificação definido no servidor.
            </p>
          </CardBody>
        </Card>

        {/* Webhook & token — full width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Credenciais da API</CardTitle>
            <Badge tone="brand">Gerenciado no servidor</Badge>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-canvas p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-ink-soft">
                <Lock className="size-[18px]" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  Token de acesso da Meta
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  O token de longa duração é cifrado (AES-256-GCM) e usado
                  apenas no backend. Por segurança, ele nunca é exposto aqui.
                </p>
              </div>
            </div>

            <div>
              <Label>Webhook URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={WEBHOOK_URL}
                  className="flex-1 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  onClick={() => copy(WEBHOOK_URL, 'webhook')}
                >
                  {copied === 'webhook' ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function AccountRow({
  icon,
  name,
  hint,
  handle,
  connected,
  onToggle,
}: {
  icon: React.ReactNode
  name: string
  hint?: string
  handle: string
  connected: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3.5">
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{name}</p>
        <p className="truncate text-xs text-ink-muted">
          {connected ? handle : (hint ?? 'Não conectado')}
        </p>
      </div>
      <Badge tone={connected ? 'success' : 'neutral'}>
        {connected ? 'Conectado' : 'Desconectado'}
      </Badge>
      <Switch checked={connected} onChange={onToggle} label={`Conectar ${name}`} />
    </div>
  )
}
