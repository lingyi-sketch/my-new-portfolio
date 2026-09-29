import { scriptSlots } from '../data/works'
import SlotCard from '../components/SlotCard'
import '../components/SlotGrid.css'
import './Section.css'

function ScriptPage() {
  return (
    <div className="page-enter container section-page">
      <header className="section-page__header">
        <span className="eyebrow">Works · Script</span>
        <h2 className="section-page__title">Script</h2>
        <p className="section-page__description">
          생성형 AI로 쓴 시나리오와 대본 작업을 모았어요.
        </p>
      </header>

      <div className="slot-grid slot-grid--dense">
        {scriptSlots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} />
        ))}
      </div>
    </div>
  )
}

export default ScriptPage
