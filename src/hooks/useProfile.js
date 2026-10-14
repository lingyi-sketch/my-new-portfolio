import { useEffect, useState } from 'react'
import { fetchProfile, fetchProfilePhotos } from '../lib/profile'
import { profile as defaultProfile } from '../data/works'

export function useProfile() {
  const [status, setStatus] = useState('loading')
  const [content, setContent] = useState(defaultProfile)
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    let cancelled = false

    Promise.all([fetchProfile(), fetchProfilePhotos()])
      .then(([row, photoRows]) => {
        if (cancelled) return
        if (row) setContent({ ...defaultProfile, ...row })
        setPhotos(photoRows)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        console.error('Failed to load profile from Supabase:', error)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { status, content, photos }
}
