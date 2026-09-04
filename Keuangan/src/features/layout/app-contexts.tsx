import { createContext, useContext } from 'react'
import type { Transaction } from '../../types/db'

/** `initial === 'new'` berarti mode tambah transaksi baru;
 * kalau berupa objek berarti mode ubah transaksi itu. */
export interface TxSheetState {
  open: boolean
  initial: Transaction | 'new' | null
}

export interface TxSheetActions {
  openNew: () => void
  openEdit: (tx: Transaction) => void
  close: () => void
}

export const TxSheetContext = createContext<TxSheetState>({
  open: false,
  initial: null
})

export const TxSheetActionsContext = createContext<TxSheetActions | null>(null)

export function useTxSheetActions(): TxSheetActions {
  const actions = useContext(TxSheetActionsContext)
  if (!actions)
    throw new Error('useTxSheetActions harus dipakai di dalam AppShell')
  return actions
}

export const ToastContext = createContext<(message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}
