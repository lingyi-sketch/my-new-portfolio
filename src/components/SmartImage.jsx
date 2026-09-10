import { useState } from 'react'
import './SmartImage.css'

function SmartImage({ src, alt, label, hoverEffect = true }) {
  const [broken, setBroken] = useState(false)

  if (!src || broken) {
    return (
      <div className="smart-image smart-image--placeholder">
        <span className="smart-image__mark">＋</span>
        <span className="smart-image__label">{label || '이미지 준비 중'}</span>
      </div>
    )
  }

  return (
    <div className={`smart-image${hoverEffect ? ' smart-image--hover' : ''}`}>
      <img src={src} alt={alt} onError={() => setBroken(true)} loading="lazy" />
    </div>
  )
}

export default SmartImage
