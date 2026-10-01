import { supabase, storageBucket } from './supabaseClient'

const EXTENSION_MIME_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  m4v: 'video/x-m4v',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
}

function buildPath(folder, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const stamp = Date.now()
  return `${folder}/${stamp}-${safeName}`
}

function resolveContentType(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const knownType = extension ? EXTENSION_MIME_TYPES[extension] : undefined
  if (knownType) return knownType
  if (file.type && file.type !== 'application/octet-stream') return file.type
  return 'application/octet-stream'
}

export async function uploadMediaFile(folder, file) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }
  if (!storageBucket) {
    throw new Error('스토리지 버킷 정보가 설정되지 않았습니다.')
  }

  const path = buildPath(folder, file)
  const contentType = resolveContentType(file)
  // supabase-js reads the Content-Type from the Blob/File's own `type` when
  // uploading it directly, so the `contentType` option alone is not enough —
  // the file has to be re-wrapped with the corrected type.
  const uploadBody = file.type === contentType ? file : new File([file], file.name, { type: contentType })

  const { error: uploadError } = await supabase.storage
    .from(storageBucket)
    .upload(path, uploadBody, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    })

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
