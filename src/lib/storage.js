import { supabase, storageBucket } from './supabaseClient'
import { compressVideo, isVideo } from './videoCompress'
import { setUploadStatus } from './uploadStatus'

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

function describeUploadError(error, contentType, size) {
  const raw = `${error.message ?? error} (${error.statusCode ?? error.status ?? '?'})`
  const text = raw.toLowerCase()
  const mb = (size / 1024 / 1024).toFixed(1)
  let hint = ''
  if (text.includes('mime') || text.includes('not supported') || text.includes('415')) {
    hint = `存储桶不允许 ${contentType} 格式。请到 Supabase → Storage → portfolio-media → Edit bucket → Allowed MIME types 添加该类型(视频需要 video/mp4)。`
  } else if (text.includes('maximum allowed size') || text.includes('too large') || text.includes('413')) {
    hint = `文件 ${mb}MB 超过存储桶/全局大小限制。请检查 Storage → Settings 的 Global file size limit 以及该存储桶的 File size limit。`
  } else if (text.includes('row-level security') || text.includes('unauthorized') || text.includes('403')) {
    hint = '没有上传权限。请确认已用管理员账号登录,并且 Storage 的上传策略已执行。'
  } else if (text.includes('failed to fetch') || text.includes('network')) {
    hint = `网络中断,文件(${mb}MB)可能太大或网络不稳定,请重试。`
  }
  return `上传失败:${hint || '未知原因'} [原始信息: ${raw}]`
}

export async function uploadMediaFile(folder, file) {
  if (!supabase) {
    throw new Error('Supabase 연결 정보가 설정되지 않았습니다.')
  }
  if (!storageBucket) {
    throw new Error('스토리지 버킷 정보가 설정되지 않았습니다.')
  }

  if (isVideo(file)) {
    try {
      setUploadStatus({ phase: 'compressing', progress: 0, message: '' })
      file = await compressVideo(file, {
        onProgress: (progress) => setUploadStatus({ progress }),
      })
      setUploadStatus({ phase: 'idle' })
    } catch (error) {
      setUploadStatus({ phase: 'error', message: error.message || String(error) })
      throw error
    }
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
    setUploadStatus({ phase: 'error', message: describeUploadError(uploadError, contentType, file.size) })
    throw uploadError
  }
  setUploadStatus({ phase: 'idle' })

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
