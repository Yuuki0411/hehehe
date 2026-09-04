import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ComparisonNote } from '../../types/db'
import type { DayKey, PeriodKind } from '../../utils/format'

export const comparisonNoteKeys = {
  all: ['comparison-notes'] as const
}

export function useComparisonNotes() {
  return useQuery({
    queryKey: comparisonNoteKeys.all,
    queryFn: async (): Promise<ComparisonNote[]> => {
      const { data, error } = await supabase
        .from('comparison_notes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })
}

export interface ComparisonNoteInput {
  period_kind: PeriodKind
  period_a_from: DayKey
  period_a_to: DayKey
  period_b_from: DayKey
  period_b_to: DayKey
  note: string
}

export function useAddComparisonNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      input: ComparisonNoteInput & { user_id: string }
    ): Promise<ComparisonNote> => {
      const { data, error } = await supabase
        .from('comparison_notes')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: comparisonNoteKeys.all })
  })
}

export function useDeleteComparisonNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('comparison_notes')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: comparisonNoteKeys.all })
  })
}

/** Memo untuk pasangan periode yang sedang dibandingkan. */
export function notesForPair(
  notes: ComparisonNote[] | undefined,
  kind: PeriodKind,
  aFrom: DayKey,
  aTo: DayKey,
  bFrom: DayKey,
  bTo: DayKey
): ComparisonNote[] {
  return (notes ?? []).filter(
    (n) =>
      n.period_kind === kind &&
      n.period_a_from === aFrom &&
      n.period_a_to === aTo &&
      n.period_b_from === bFrom &&
      n.period_b_to === bTo
  )
}
