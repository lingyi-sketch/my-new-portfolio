import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}
