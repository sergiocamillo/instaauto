import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth'
import { RequireAuth } from '@/components/RequireAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Automations } from '@/pages/Automations'
import { CreateAutomation } from '@/pages/CreateAutomation'
import { Contacts } from '@/pages/Contacts'
import { Messages } from '@/pages/Messages'
import { Files } from '@/pages/Files'
import { Settings } from '@/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/automacoes" element={<Automations />} />
              <Route path="/automacoes/nova" element={<CreateAutomation />} />
              <Route path="/contatos" element={<Contacts />} />
              <Route path="/mensagens" element={<Messages />} />
              <Route path="/arquivos" element={<Files />} />
              <Route path="/configuracoes" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
