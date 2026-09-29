import { supabase, storageBucket } from './supabaseClient'

function buildPath(folder, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const stamp = Date.now()
  return `${folder}/${stamp}-${safeName}`
}

export async function uploadMediaFile(folder, file) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }
  if (!storageBucket) {
    throw new Error('스토리지 버킷 정보가 설정되지 않았습니다.')
  }

  const path = buildPath(folder, file)

  const { error: uploadError } = await supabase.storage
    .from(storageBucket)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from(storageBucket).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteMediaFile(url) {
  if (!supabase || !storageBucket || !url) return

  const marker = `/object/public/${storageBucket}/`
  const markerIndex = url.indexOf(marker)
  if (markerIndex === -1) return

  const path = decodeURIComponent(url.slice(markerIndex + marker.length))

  const { error } = await supabase.storage.from(storageBucket).remove([path])
  if (error) {
    console.error('Failed to delete storage file:', path, error)
  }
}
