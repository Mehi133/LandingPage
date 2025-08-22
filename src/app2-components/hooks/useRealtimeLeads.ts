
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Lead } from '@/types/database'

export function useRealtimeLeads() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('New lead received:', payload)
          const newLead = payload.new as Lead
          
          // Invalidate relevant queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['leads'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('Lead updated:', payload)
          queryClient.invalidateQueries({ queryKey: ['leads'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  // Fallback polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }, 30000)

    return () => clearInterval(interval)
  }, [queryClient])
}
