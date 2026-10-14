import { useEffect, useState } from 'react'
import { fetchAssignments } from '../lib/assignments'
import { fetchSetting } from '../lib/settings'
import { WEEK_ORDER_KEY } from '../lib/weekOrder'

export function useAssignments() {
  const [status, setStatus] = useState('loading')
  const [assignments, setAssignments] = useState([])
  const [weekOrder, setWeekOrder] = useState(null)

  useEffect(() => {
    let cancelled = false

    const orderPromise = fetchSetting(WEEK_ORDER_KEY).catch((error) => {
      console.error('Failed to load week order from Supabase:', error)
      return null
    })

    Promise.all([fetchAssignments(), orderPromise])
      .then(([data, order]) => {
        if (cancelled) return
        setAssignments(data)
        setWeekOrder(order)
        setStatus(data.length === 0 ? 'empty' : 'success')
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Failed to load assignments from Supabase:', error)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { status, assignments, weekOrder }
}
