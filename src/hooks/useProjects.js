import { useEffect, useState } from 'react'
import { fetchProjects } from '../lib/projects'

export function useProjects() {
  const [status, setStatus] = useState('loading')
  const [projects, setProjects] = useState([])

  useEffect(() => {
    let cancelled = false

    setStatus('loading')

    fetchProjects()
      .then((data) => {
        if (cancelled) return
        setProjects(data)
        setStatus(data.length === 0 ? 'empty' : 'success')
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Failed to load projects from Supabase:', error)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { status, projects }
}
