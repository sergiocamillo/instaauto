import { useNavigate } from 'react-router-dom'
import { Link2, ArrowRight } from 'lucide-react'
import { useHasConnectedAccount } from '@/lib/hooks'
import { Button } from '@/components/ui/Button'

/**
 * Aviso exibido enquanto nenhuma conta da Meta está conectada. As automações
 * não disparam sem conexão, então direcionamos o usuário às Configurações.
 */
export function ConnectBanner() {
  const navigate = useNavigate()
  const { connected, isLoading } = useHasConnectedAccount()

  if (isLoading || connected) return null

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-brand-100 bg-brand-50 px-4 py-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-600 text-white">
        <Link2 className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">
          Conecte sua conta do Instagram
        </p>
        <p className="text-xs text-ink-soft">
          Nenhuma automação dispara até você conectar uma conta. Leva menos de um
          minuto.
        </p>
      </div>
      <Button size="sm" onClick={() => navigate('/configuracoes')}>
        Conectar agora
        <ArrowRight className="size-3.5" />
      </Button>
    </div>
  )
}
