import { useLanguage } from '../i18n/LanguageContext'
import SmartImage from './SmartImage'
import { FilePreview, fileExtension } from './FilePreview'
import './SlotCard.css'

const PREVIEWABLE_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'mp4', 'mov', 'webm', 'm4v'])

function FileIconFallback({ url }) {
  const { t } = useLanguage()

  return (
    <a className="slot-card__file-icon" href={url} target="_blank" rel="noreferrer" aria-label={t('common.viewFile')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M6 2.5h8l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" />
        <path d="M14 2.5V7a1 1 0 0 0 1 1h4.5" />
        <path d="M8 13h8M8 16.5h8M8 9.5h3" />
      </svg>
      <span className="slot-card__file-type">FILE</span>
    </a>
  )
}

function SlotCard({ slot }) {
  const { t } = useLanguage()
  const hasImage = Boolean(slot.image)
  const hasFile = Boolean(slot.fileUrl)
  const canPreview = hasFile && PREVIEWABLE_EXTENSIONS.has(fileExtension(slot.fileUrl))

  return (
    <div className="slot-card">
      <div className={`slot-card__frame${slot.landscape ? ' slot-card__frame--landscape' : ''}`}>
        {!hasImage && hasFile ? (
          canPreview ? (
            <FilePreview url={slot.fileUrl} title={slot.title} />
          ) : (
            <FileIconFallback url={slot.fileUrl} />
          )
        ) : (
          <SmartImage src={slot.image} alt={slot.title} label={slot.title} />
        )}
        <span className="slot-card__index">{slot.index}</span>
      </div>
      <div className="slot-card__caption">
        <h3 className="slot-card__title">{slot.title}</h3>
        <p className="slot-card__description">{slot.description || t('common.noDescriptionYet')}</p>
        {hasFile && (
          <a className="slot-card__file" href={slot.fileUrl} target="_blank" rel="noreferrer">
            {slot.fileLabel || t('common.viewFile')} →
          </a>
        )}
      </div>
    </div>
  )
}

export default SlotCard
