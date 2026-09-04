import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Category, TxType } from '../../types/db'

export const categoryKeys = {
  all: ['categories'] as const
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true })
      if (error) throw error
      return data
    }
  })
}

export function useAddCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      name: string
      type: TxType
      user_id: string
    }): Promise<Category> => {
      const { data, error } = await supabase
        .from('categories')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all })
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      const { error } = await supabase
        .from('categories')
        .update({ name: input.name })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all })
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    // Transaksi terkait otomatis kehilangan kategori (FK on delete set null).
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
}

/** Peta categoryId -> nama untuk menampilkan label. */
export function categoryNameMap(
  categories: Category[] | undefined
): Map<string, string> {
  const map = new Map<string, string>()
  for (const c of categories ?? []) map.set(c.id, c.name)
  return map
}
