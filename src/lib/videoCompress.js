// Supabase Free caps a single upload at 50 MB; stay a little under it.
export const MAX_UPLOAD_BYTES = 45 * 1024 * 1024

const AUDIO_BITRATE = 192_000 // upper bound reserved for audio (AAC is copied/re-encoded at or below this)
const OVERHEAD = 0.97 // container + rate-control overshoot margin
const MIN_VIDEO_BITRATE = 400_000

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'm4v']

export function isVideo(file) {
  if (file.type?.startsWith('video/')) return true
  const extension = file.name.split('.').pop()?.toLowerCase()
  return VIDEO_EXTENSIONS.includes(extension)
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

async function encode(file, videoBitrate, onProgress) {
  const { Input, Output, Conversion, BlobSource, BufferTarget, Mp4OutputFormat, ALL_FORMATS } =
    await import('mediabunny')

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS })
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() })

  // No width/height/frameRate given → resolution and frame rate stay as in the source.
  const conversion = await Conversion.init({
    input,
    output,
    video: { codec: 'avc', bitrate: videoBitrate },
    audio: { codec: 'aac', bitrate: AUDIO_BITRATE },
  })
  if (!conversion.isValid) {
    throw new Error('이 브라우저에서는 이 영상을 압축할 수 없습니다. (Chrome / Edge 최신 버전을 사용해 주세요)')
  }
  conversion.onProgress = (progress) => onProgress?.(progress)
  await conversion.execute()

  return new Blob([output.target.buffer], { type: 'video/mp4' })
}

async function readDuration(file) {
  const { Input, BlobSource, ALL_FORMATS } = await import('mediabunny')
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS })
  return input.computeDuration()
}

/**
 * Re-encodes `file` to MP4 (H.264 + AAC) so it fits under `maxBytes`.
 * Resolution, frame rate and audio channels are kept; only the bitrate is lowered, using the
 * highest value that still fits. Files already under the limit are returned untouched
 * (re-encoding them could only lose quality).
 */
export async function compressVideo(file, { maxBytes = MAX_UPLOAD_BYTES, onProgress } = {}) {
  if (file.size <= maxBytes) return file

  if (typeof VideoEncoder === 'undefined') {
    throw new Error('이 브라우저는 영상 압축을 지원하지 않습니다. Chrome 또는 Edge 최신 버전을 사용해 주세요.')
  }

  const duration = await readDuration(file)
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('영상 길이를 읽을 수 없어 압축하지 못했습니다.')
  }

  let budgetFactor = OVERHEAD
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const totalBitrate = (maxBytes * 8 * budgetFactor) / duration
    const videoBitrate = Math.floor(totalBitrate - AUDIO_BITRATE)
    if (videoBitrate < MIN_VIDEO_BITRATE) {
      throw new Error(
        `영상이 너무 길어(${Math.round(duration)}초) 화질을 유지한 채 ${formatMb(maxBytes)} 이하로 줄일 수 없습니다. 영상을 나눠서 올려 주세요.`,
      )
    }

    const blob = await encode(file, videoBitrate, onProgress)
    if (blob.size <= maxBytes) {
      const baseName = file.name.replace(/\.[^.]+$/, '')
      return new File([blob], `${baseName}.mp4`, { type: 'video/mp4' })
    }
    // Encoder overshot the target bitrate: try again with a tighter budget.
    budgetFactor *= (maxBytes / blob.size) * 0.97
  }

  throw new Error(`압축 후에도 ${formatMb(maxBytes)}를 넘었습니다. 영상을 나눠서 올려 주세요.`)
}
