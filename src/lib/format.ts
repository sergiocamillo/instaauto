/** Locale-aware (pt-BR) formatting helpers. */

export const nf = new Intl.NumberFormat('pt-BR')

export function formatNumber(n: number) {
  return nf.format(n)
}

export function formatCompact(n: number) {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

/** "há 2 horas", "ontem", "12 jun" — relative for recent, absolute beyond. */
export function timeAgo(iso: string | null): string {
  if (!iso) return 'Nunca'
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const min = Math.round(diff / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `há ${min} min`
  const hours = Math.round(min / 60)
  if (hours < 24) return `há ${hours} h`
  const days = Math.round(hours / 24)
  if (days === 1) return 'ontem'
  if (days < 7) return `há ${days} dias`
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
