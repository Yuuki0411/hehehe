import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Wallet } from '../../types/db'

export const walletKeys = {
  all: ['wallets'] as const
}

export function useWallets() {
  return useQuery({
    queryKey: walletKeys.all,
    queryFn: async (): Promise<Wallet[]> => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    }
  })
}

export function useAddWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; user_id: string }): Promise<Wallet> => {
      const { data, error } = await supabase
        .from('wallets')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: walletKeys.all })
  })
}

export function useUpdateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      const { error } = await supabase
        .from('wallets')
        .update({ name: input.name })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
}

export function useDeleteWallet() {
  const qc = useQueryClient()
  return useMutation({
    // FK on delete restrict: server menolak bila dompet masih dipakai transaksi.
    mutationFn: async (walletId: string) => {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', walletId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
}

/** Peta walletId -> nama untuk menampilkan label. */
export function walletNameMap(
  wallets: Wallet[] | undefined
): Map<string, string> {
  const map = new Map<string, string>()
  for (const w of wallets ?? []) map.set(w.id, w.name)
  return map
}
