import { useEffect, useState } from 'react'
import { fetchAssignments } from '../lib/assignments'

export function useAssignments() {
  const [status, setStatus] = useState('loading')
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    let cancelled = false

    fetchAssignments()
      .then((data) => {
        if (cancelled) return
        setAssignments(data)
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

  return { status, assignments }
}
