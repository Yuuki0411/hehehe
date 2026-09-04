import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/db'

export const profileKeys = {
  detail: (userId: string) => ['profile', userId] as const
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId ?? 'anon'),
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .maybeSingle()
      if (error) throw error
      return data
    }
  })
}

export function useSetUsername() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (username: string) => {
      const { error } = await supabase.rpc('set_my_username', {
        p_username: username
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}
