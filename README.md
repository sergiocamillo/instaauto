# InstaAuto

Painel privado para automação de interações no Instagram/Facebook — inspirado no ManyChat, mas pessoal, para um único usuário. **Versão protótipo:** toda a interface funciona com dados simulados (mock); a integração real com a Meta API ainda não está conectada.

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (tema com tipografia Inter e azul de marca)
- **React Router** (rotas protegidas por login)
- **Recharts** (gráfico de interações)
- **lucide-react** (ícones)

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção
npm run lint     # eslint
```

## Login (protótipo)

A autenticação é **mockada**: qualquer e-mail válido + senha de 6+ caracteres entra. O botão "Entrar com Google" também é simulado. A sessão é salva no `localStorage`.

## Telas

| Rota | Descrição |
|------|-----------|
| `/login` | Login por e-mail/senha e Google |
| `/` | Dashboard: cards, gráfico de 7 dias, últimas execuções |
| `/automacoes` | Lista de automações (status, execuções, CTR, editar/excluir) |
| `/automacoes/nova` | Assistente em 3 passos (gatilho → palavra-chave → ação) com pré-visualização ao vivo da DM |
| `/contatos` | Contatos com busca e filtros por tag |
| `/mensagens` | Histórico de mensagens enviadas |
| `/arquivos` | Arquivos mockados (PDF/imagem/vídeo/doc) com copiar link |
| `/configuracoes` | Contas conectadas, token de API e webhook (mockados) |

## Estrutura

```
src/
  lib/            # tipos, store reativo (localStorage), auth, catálogo, formatadores
  components/
    ui/           # primitivos reutilizáveis (Button, Card, Badge, Switch, Field…)
    layout/       # Sidebar, Topbar, AppLayout, Logo
    icons/        # glifos de marca (Instagram/Facebook)
  features/
    dashboard/    # StatCard, InteractionsChart
    wizard/       # Stepper, DmPreview
  pages/          # uma página por rota
```

## Pronto para o backend real

Os tipos em `src/lib/types.ts` espelham o esquema planejado do Supabase
(`profiles`, `connected_accounts`, `automations`, `automation_triggers`,
`automation_actions`, `contacts`, `messages`, `files`, `tags`, `contact_tags`,
`analytics_events`). Cada registro carrega `user_id`, preparando o terreno para RLS.

Para conectar de verdade:

1. Substituir o store mock (`src/lib/store.ts`) por queries autenticadas ao Supabase.
2. Trocar o auth mock (`src/lib/auth.tsx`) por Supabase Auth (e-mail/senha + OAuth Google) — a API já tem o mesmo formato (`signInWithPassword`, `signInWithGoogle`, `signOut`).
3. Tokens da Meta ficam **somente em Edge Functions**, nunca no frontend.
