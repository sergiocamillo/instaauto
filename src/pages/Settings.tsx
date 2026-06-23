import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Plug,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react'
import { InstagramGlyph, FacebookGlyph } from '@/components/icons/Brand'
import {
  useAccounts,
  useConnectAccount,
  useDisconnectAccount,
} from '@/lib/hooks'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/Misc'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'
const WEBHOOK_URL = `${API_URL}/webhooks/meta`

export function Settings() {
  const { data: accounts = [], isLoading } = useAccounts()
  const connect = useConnectAccount()
  const disconnect = useDisconnectAccount()
  const [copied, setCopied] = useState<string | null>(null)

  // Lê o resultado do retorno do OAuth (?connected=1 ou ?error=1&reason=...).
  const [params, setParams] = useSearchParams()

  // Calcula o banner uma única vez a partir da query inicial (sem effect).
  const [banner, setBanner] = useState<
    { kind: 'ok' | 'error'; text: string } | null
  >(() => {
    if (params.get('connected')) {
      return { kind: 'ok', text: 'Conta conectada com sucesso! 🎉' }
    }
    if (params.get('error')) {
      const reason = params.get('reason')
      return {
        kind: 'error',
        text: reason
          ? `Não foi possível conectar: ${decodeURIComponent(reason)}`
          : 'Não foi possível conectar. Tente novamente.',
      }
    }
    return null
  })

  // Limpa os query params da URL após capturá-los.
  useEffect(() => {
    if (!params.get('connected') && !params.get('error')) return
    const next = new URLSearchParams(params)
    next.delete('connected')
    next.delete('error')
    next.delete('reason')
    setParams(next, { replace: true })
  }, [params, setParams])

  function copy(value: string, key: string) {
    navigator.clipboard?.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(null), 1600)
  }

  const igAccount = accounts.find((a) => a.platform === 'instagram')
  const fbAccount = accounts.find((a) => a.platform === 'facebook')
  const igConnected = igAccount?.status === 'connected'
  const fbConnected = fbAccount?.status === 'connected'
  const anyConnected = igConnected || fbConnected

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Conecte sua conta do Instagram e gerencie o webhook da Meta."
      />

      {/* Banner de resultado do OAuth */}
      {banner && (
        <div
          className={
            'mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ' +
            (banner.kind === 'ok'
              ? 'border-success/30 bg-success-soft text-success'
              : 'border-danger/30 bg-danger-soft text-danger')
          }
        >
          {banner.kind === 'ok' ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          )}
          <span className="flex-1 break-words">{banner.text}</span>
          <button onClick={() => setBanner(null)} aria-label="Fechar">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Conexão — destaque principal */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Conectar conta</CardTitle>
          {anyConnected ? (
            <Badge tone="success">
              <span className="size-1.5 rounded-full bg-success" />
              Conectado
            </Badge>
          ) : (
            <Badge tone="warning">Nenhuma conta conectada</Badge>
          )}
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-sm text-ink-soft">
            Escolha como conectar seu Instagram. A conexão abre o consentimento
            oficial da Meta — o token fica cifrado no servidor e nunca chega ao
            navegador.
          </p>

          {isLoading ? (
            <div className="grid h-24 place-items-center">
              <Loader2 className="size-5 animate-spin text-brand-600" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <ConnectCard
                provider="instagram"
                icon={
                  <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white">
                    <InstagramGlyph className="size-6" />
                  </span>
                }
                title="Instagram"
                subtitle="Creator ou Business sem Página do Facebook"
                handle={igAccount?.handle}
                connected={igConnected}
                loading={connect.isPending || disconnect.isPending}
                onConnect={() => connect.mutate('instagram')}
                onDisconnect={() => disconnect.mutate('instagram')}
              />
              <ConnectCard
                provider="facebook"
                icon={
                  <span className="grid size-11 place-items-center rounded-xl bg-[#1877f2] text-white">
                    <FacebookGlyph className="size-6" />
                  </span>
                }
                title="Facebook"
                subtitle="Business com Página vinculada ao Instagram"
                handle={fbAccount?.handle}
                connected={fbConnected}
                loading={connect.isPending || disconnect.isPending}
                onConnect={() => connect.mutate('facebook')}
                onDisconnect={() => disconnect.mutate('facebook')}
              />
            </div>
          )}
        </CardBody>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Connection status */}
        <Card>
          <CardHeader>
            <CardTitle>Status da conexão</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-3 rounded-xl bg-canvas p-4">
              <span
                className={
                  'grid size-11 place-items-center rounded-full ' +
                  (anyConnected
                    ? 'bg-success-soft text-success'
                    : 'bg-canvas text-ink-muted ring-1 ring-border')
                }
              >
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  {anyConnected ? 'Webhook ativo' : 'Aguardando conexão'}
                </p>
                <p className="text-xs text-ink-soft">
                  {anyConnected
                    ? 'Recebendo eventos de comentários e DMs.'
                    : 'Conecte uma conta para começar a receber eventos.'}
                </p>
              </div>
              <Badge tone={anyConnected ? 'success' : 'neutral'} className="ml-auto">
                {anyConnected ? 'Online' : 'Offline'}
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

function ConnectCard({
  icon,
  title,
  subtitle,
  handle,
  connected,
  loading,
  onConnect,
  onDisconnect,
}: {
  provider: 'instagram' | 'facebook'
  icon: React.ReactNode
  title: string
  subtitle: string
  handle?: string
  connected: boolean
  loading: boolean
  onConnect: () => void
  onDisconnect: () => void
}) {
  return (
    <div
      className={
        'flex flex-col rounded-xl border p-4 transition-colors ' +
        (connected
          ? 'border-success/30 bg-success-soft/30'
          : 'border-border bg-surface')
      }
    >
      <div className="flex items-start gap-3">
        {icon}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-ink">{title}</p>
            {connected && (
              <Badge tone="success">
                <Check className="size-3" />
                Conectado
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-soft">
            {connected && handle ? handle : subtitle}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {connected ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={loading}
            onClick={onDisconnect}
          >
            Desconectar
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full"
            loading={loading}
            onClick={onConnect}
          >
            {!loading && <Plug className="size-4" />}
            Conectar {title}
          </Button>
        )}
      </div>
    </div>
  )
}
