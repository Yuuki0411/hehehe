export type TxType = 'income' | 'expense'

export interface Category {
  id: string
  user_id: string
  name: string
  type: TxType
  created_at: string
}

/** Kolom `occurred_on` di Postgres bertipe DATE -> selalu 'YYYY-MM-DD'. */
export interface Transaction {
  id: string
  user_id: string
  type: TxType
  amount: number
  category_id: string | null
  wallet_id: string
  occurred_on: string
  note: string | null
  created_at: string
}

/** Sumber dana tempat setiap transaksi wajib tercatat. */
export interface Wallet {
  id: string
  user_id: string
  name: string
  created_at: string
}

/** Memo yang menempel pada satu perbandingan dua periode. */
export interface ComparisonNote {
  id: string
  user_id: string
  period_kind: 'day' | 'week' | 'month'
  period_a_from: string
  period_a_to: string
  period_b_from: string
  period_b_to: string
  note: string
  created_at: string
}

/** Profil akun; username dipakai sebagai identitas login selain email. */
export interface Profile {
  id: string
  username: string | null
  created_at: string
  updated_at: string
}
