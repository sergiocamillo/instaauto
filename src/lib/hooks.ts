import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  accountsApi,
  automationsApi,
  contactsApi,
  dashboardApi,
  filesApi,
  messagesApi,
  type AutomationInput,
} from './api-resources'
import type { Message, StoredFile } from './types'

/* ----------------------------- Automations ---------------------------- */

export function useAutomations() {
  return useQuery({ queryKey: ['automations'], queryFn: automationsApi.list })
}

export function useCreateAutomation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AutomationInput) => automationsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }),
  })
}

export function useUpdateAutomation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AutomationInput }) =>
      automationsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }),
  })
}

export function useToggleAutomation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: 'active' | 'inactive'
    }) => automationsApi.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }),
  })
}

export function useDeleteAutomation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => automationsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }),
  })
}

/* ------------------------------ Contacts ------------------------------ */

export function useContacts(params?: { q?: string; tag?: string }) {
  return useQuery({
    queryKey: ['contacts', params ?? {}],
    queryFn: () => contactsApi.list(params),
  })
}

/* ------------------------------ Messages ------------------------------ */

export function useMessages(status?: Message['status']) {
  return useQuery({
    queryKey: ['messages', status ?? 'all'],
    queryFn: () => messagesApi.list(status),
  })
}

/* -------------------------------- Files ------------------------------- */

export function useFiles() {
  return useQuery({ queryKey: ['files'], queryFn: filesApi.list })
}

export function useCreateFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      name: string
      type: StoredFile['type']
      url: string
      sizeLabel?: string
    }) => filesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files'] }),
  })
}

export function useUploadFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => filesApi.upload(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files'] }),
  })
}

export function useDeleteFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => filesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files'] }),
  })
}

/* ------------------------------ Dashboard ----------------------------- */

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.overview })
}

/* ------------------------------ Accounts ------------------------------ */

export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: accountsApi.status })
}

/** True quando há ao menos uma conta conectada. */
export function useHasConnectedAccount() {
  const { data, isLoading } = useAccounts()
  const connected = (data ?? []).some((a) => a.status === 'connected')
  return { connected, isLoading }
}

export function useMedia(enabled = true) {
  return useQuery({
    queryKey: ['media'],
    queryFn: accountsApi.media,
    enabled,
    staleTime: 60_000,
  })
}

export function useConnectAccount() {
  return useMutation({
    mutationFn: (provider: 'instagram' | 'facebook') =>
      accountsApi.connect(provider),
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })
}

export function useDisconnectAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (platform: 'instagram' | 'facebook') =>
      accountsApi.disconnect(platform),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}
