import { useEffect, useState } from 'react'
import { fetchSetting } from '../lib/settings'
import { NAV_ORDER_KEY } from '../lib/navOrder'

export function useNavOrder() {
  const [order, setOrder] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchSetting(NAV_ORDER_KEY)
      .then((value) => {
        if (!cancelled && Array.isArray(value)) setOrder(value)
      })
      .catch((error) => {
        console.error('Failed to load menu order from Supabase:', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return order
}
