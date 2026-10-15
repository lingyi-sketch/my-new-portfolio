import { useCallback, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import SmartImage from './SmartImage'
import DocumentViewer from './DocumentViewer'
import './SlotCard.css'

function ScriptCard({ slot }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <div className="slot-card">
      <div className="slot-card__frame slot-card__frame--landscape">
        <SmartImage src={slot.image} alt={slot.title} label={slot.title} />
        <span className="slot-card__index">{slot.index}</span>
        {slot.fileUrl && (
          <button type="button" className="slot-card__open" onClick={() => setOpen(true)}>
            {t('script.view')}
          </button>
        )}
      </div>
      <div className="slot-card__caption">
        <h3 className="slot-card__title">{slot.title}</h3>
        <p className="slot-card__description">{slot.description || t('common.noDescriptionYet')}</p>
      </div>
      {open && <DocumentViewer url={slot.fileUrl} title={slot.title} onClose={close} />}
    </div>
  )
}

export default ScriptCard
