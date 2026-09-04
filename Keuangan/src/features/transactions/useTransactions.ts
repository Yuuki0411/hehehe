import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Transaction } from '../../types/db'
import type { DayKey } from '../../utils/format'

export const txKeys = {
  all: ['transactions'] as const,
  range: (from: DayKey, to: DayKey) => ['transactions', from, to] as const
}

async function fetchRange(from: DayKey, to: DayKey): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('occurred_on', from)
    .lte('occurred_on', to)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

/** Transaksi dalam rentang tanggal inklusif. */
export function useTransactions(from?: DayKey, to?: DayKey) {
  return useQuery({
    queryKey: txKeys.range(from!, to!),
    queryFn: () => fetchRange(from!, to!),
    enabled: Boolean(from && to)
  })
}

/** Data yang dikirim saat menyimpan/mengubah transaksi. */
export interface TxInput {
  type: 'income' | 'expense'
  amount: number
  category_id: string | null
  wallet_id: string
  occurred_on: string
  note: string | null
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: txKeys.all })
}

export function useInsertTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      input: TxInput & { user_id: string }
    ): Promise<Transaction> => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidate(qc)
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...changes
    }: Partial<TxInput> & { id: string }): Promise<Transaction> => {
      const { data, error } = await supabase
        .from('transactions')
        .update(changes)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidate(qc)
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidate(qc)
  })
}
