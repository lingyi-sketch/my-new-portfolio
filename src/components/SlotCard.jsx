import SmartImage from './SmartImage'
import './SlotCard.css'

function SlotCard({ slot }) {
  return (
    <div className="slot-card">
      <div className="slot-card__frame">
        <SmartImage src={slot.image} alt={slot.title} label={slot.title} />
        <span className="slot-card__index">{slot.index}</span>
      </div>
      <div className="slot-card__caption">
        <h3 className="slot-card__title">{slot.title}</h3>
        <p className="slot-card__description">
          {slot.description || '아직 소개 글이 없어요. 등록되면 이 자리에 표시돼요.'}
        </p>
        {slot.fileUrl && (
          <a className="slot-card__file" href={slot.fileUrl} target="_blank" rel="noreferrer">
            {slot.fileLabel || '파일 보기'} →
          </a>
        )}
      </div>
    </div>
  )
}

export default SlotCard
