import { useLanguage } from '../i18n/LanguageContext'
import './LinkCard.css'

const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'm4v'])
const DOC_EXTENSIONS = new Set(['doc', 'docx'])

export function fileExtension(url) {
  return url?.split('.').pop()?.split(/[?#]/)[0]?.toLowerCase()
}

export function isVideoFile(url) {
  return VIDEO_EXTENSIONS.has(fileExtension(url))
}

export function canPreviewFile(url) {
  const extension = fileExtension(url)
  return isVideoFile(url) || extension === 'pdf' || DOC_EXTENSIONS.has(extension)
}

export function canEmbed(url) {
  return Boolean(embedUrl(url)) || isVideoFile(url)
}

export function embedUrl(url) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v')
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
      }
      const match = parsed.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)
      return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null
    }
    if (host === 'vimeo.com') {
      const match = parsed.pathname.match(/^\/(\d+)/)
      return match ? `https://player.vimeo.com/video/${match[1]}` : null
    }
  } catch {
    return null
  }
  return null
}

export function FilePreview({ url, title, className = 'slot-card__preview' }) {
  const extension = fileExtension(url)

  if (isVideoFile(url)) {
    return <video className={className} src={url} controls muted playsInline preload="metadata" />
  }

  if (extension === 'pdf') {
    return <iframe className={className} src={url} title={title} />
  }

  if (DOC_EXTENSIONS.has(extension)) {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    return <iframe className={className} src={viewerUrl} title={title} />
  }

  return null
}

export function parseHttpUrl(value) {
  try {
    const parsed = new URL(value)
    return /^https?:$/.test(parsed.protocol) ? parsed : null
  } catch {
    return null
  }
}

export function LinkCard({ url }) {
  const { t } = useLanguage()
  const parsed = parseHttpUrl(url)
  if (!parsed) return null

  const path = `${parsed.pathname}${parsed.search}`.replace(/^\/$/, '')

  return (
    <a className="link-card" href={url} target="_blank" rel="noreferrer">
      <span className="link-card__host">{parsed.hostname.replace(/^www\./, '')}</span>
      {path && <span className="link-card__path">{path}</span>}
      <span className="link-card__open">{t('common.openNewTab')}</span>
    </a>
  )
}

export function UrlPreview({ url, title, mediaClassName, previewClassName }) {
  if (!parseHttpUrl(url)) return null

  if (canEmbed(url)) {
    return (
      <div className={mediaClassName}>
        <LinkPreview url={url} title={title} className={previewClassName} />
      </div>
    )
  }

  return <LinkCard url={url} />
}

export function LinkPreview({ url, title, className = 'slot-card__preview' }) {
  const embed = embedUrl(url)

  if (embed) {
    return (
      <iframe
        className={className}
        src={embed}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  if (isVideoFile(url)) {
    return <video className={className} src={url} controls muted playsInline preload="metadata" />
  }

  return null
}
