
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Lead } from '@/types/database'

export function useLeads(dateKey?: string) {
  return useQuery({
    queryKey: ['leads', dateKey],
    queryFn: async () => {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false })
      
      if (dateKey) {
        query = query.eq('date_key', dateKey)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as Lead[]
    }
  })
}

export function useLeadsByMonth(year: number, month: number) {
  return useQuery({
    queryKey: ['leads', 'month', year, month],
    queryFn: async () => {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .gte('date_key', startDate)
        .lte('date_key', endDate)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Lead[]
    }
  })
}
