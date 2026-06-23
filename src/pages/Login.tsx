import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Input, Label, FormError } from '@/components/ui/Field'
import { Logo } from '@/components/layout/Logo'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

export function Login() {
  const { signInWithPassword, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<'password' | 'google' | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (mode === 'register' && name.trim().length < 2) {
      setError('Informe seu nome.')
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Informe um e-mail válido.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.')
      return
    }
    try {
      setLoading('password')
      if (mode === 'register') {
        await register(email, name.trim(), password)
      } else {
        await signInWithPassword(email, password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Não foi possível entrar. Verifique seus dados.'
      setError(Array.isArray(msg) ? msg[0] : msg)
      setLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[46%] lg:px-20">
        <div className="mx-auto w-full max-w-sm animate-in">
          <Logo className="mb-10" />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            {mode === 'login'
              ? 'Acesse seu painel de automações do Instagram.'
              : 'Comece a automatizar suas interações em minutos.'}
          </p>

          <Button
            variant="outline"
            size="lg"
            className="mt-7 w-full"
            disabled
            title="Em breve"
          >
            <GoogleIcon />
            Entrar com Google
            <span className="ml-1 rounded-full bg-canvas px-2 py-0.5 text-[10px] font-medium text-ink-muted">
              em breve
            </span>
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
            <span className="h-px flex-1 bg-border" />
            ou com e-mail
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Seu nome"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  placeholder="••••••••"
                  className="px-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-soft"
                  aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPw ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <FormError>{error}</FormError>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading === 'password'}
            >
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError('')
              }}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
          <p className="mt-3 text-center text-xs text-ink-muted">
            Sistema pessoal e privado · acesso protegido por login.
          </p>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden flex-1 overflow-hidden bg-brand-600 lg:block">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(60% 60% at 80% 10%, #5b8bff 0%, transparent 60%), radial-gradient(50% 50% at 10% 90%, #1a4bcc 0%, transparent 55%)',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-14 text-white">
          <div />
          <div>
            <p className="text-3xl font-semibold leading-snug tracking-tight">
              Responda comentários e DMs
              <br />
              automaticamente.
            </p>
            <p className="mt-4 max-w-md text-brand-100">
              Capture leads de Reels, Stories e publicações. Entregue links e
              materiais em segundos — sem responder um por um.
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-2xl font-semibold">2.6k+</p>
              <p className="text-brand-200">interações captadas</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">4</p>
              <p className="text-brand-200">automações ativas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
