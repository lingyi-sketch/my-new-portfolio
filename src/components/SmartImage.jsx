import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import './SmartImage.css'

function SmartImage({ src, alt, label, hoverEffect = true, color = false }) {
  const { t } = useLanguage()
  const [broken, setBroken] = useState(false)

  if (!src || broken) {
    return (
      <div className="smart-image smart-image--placeholder">
        <span className="smart-image__mark">＋</span>
        <span className="smart-image__label">{label || t('common.imagePending')}</span>
      </div>
    )
  }

  return (
    <div className={`smart-image${hoverEffect ? ' smart-image--hover' : ''}${color ? ' smart-image--color' : ''}`}>
      <img src={src} alt={alt} onError={() => setBroken(true)} loading="lazy" />
    </div>
  )
}

export default SmartImage
