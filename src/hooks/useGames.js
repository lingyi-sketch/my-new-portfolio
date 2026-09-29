import { useEffect, useState } from 'react'
import { fetchGames } from '../lib/games'

export function useGames() {
  const [status, setStatus] = useState('loading')
  const [games, setGames] = useState([])

  useEffect(() => {
    let cancelled = false

    setStatus('loading')

    fetchGames()
      .then((data) => {
        if (cancelled) return
        setGames(data)
        setStatus(data.length === 0 ? 'empty' : 'success')
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Failed to load games from Supabase:', error)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { status, games }
}
