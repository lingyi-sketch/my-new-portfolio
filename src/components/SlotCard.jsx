import SmartImage from './SmartImage'
import './SlotCard.css'

const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'm4v'])

function fileExtension(url) {
  return url?.split('.').pop()?.split(/[?#]/)[0]?.toLowerCase()
}

function fileTypeLabel(url) {
  const extension = fileExtension(url)
  if (extension === 'pdf') return 'PDF'
  if (extension === 'doc' || extension === 'docx') return 'DOC'
  if (VIDEO_EXTENSIONS.has(extension)) return 'VIDEO'
  return 'FILE'
}

function SlotCard({ slot }) {
  const hasImage = Boolean(slot.image)
  const hasFile = Boolean(slot.fileUrl)

  return (
    <div className="slot-card">
      <div className="slot-card__frame">
        {!hasImage && hasFile ? (
          <a
            className="slot-card__file-icon"
            href={slot.fileUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={slot.fileLabel || '파일 보기'}
          >
            {VIDEO_EXTENSIONS.has(fileExtension(slot.fileUrl)) ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
                <path d="M10 9.2v5.6l5-2.8-5-2.8Z" fill="currentColor" stroke="none" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M6 2.5h8l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" />
                <path d="M14 2.5V7a1 1 0 0 0 1 1h4.5" />
                <path d="M8 13h8M8 16.5h8M8 9.5h3" />
              </svg>
            )}
            <span className="slot-card__file-type">{fileTypeLabel(slot.fileUrl)}</span>
          </a>
        ) : (
          <SmartImage src={slot.image} alt={slot.title} label={slot.title} />
        )}
        <span className="slot-card__index">{slot.index}</span>
      </div>
      <div className="slot-card__caption">
        <h3 className="slot-card__title">{slot.title}</h3>
        <p className="slot-card__description">
          {slot.description || '아직 소개 글이 없어요. 등록되면 이 자리에 표시돼요.'}
        </p>
        {hasFile && (
          <a className="slot-card__file" href={slot.fileUrl} target="_blank" rel="noreferrer">
            {slot.fileLabel || '파일 보기'} →
          </a>
        )}
      </div>
    </div>
  )
}

export default SlotCard
