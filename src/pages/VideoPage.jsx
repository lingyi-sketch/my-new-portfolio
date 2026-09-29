import { profile, videoSlots } from '../data/works'
import SlotCard from '../components/SlotCard'
import '../components/SlotGrid.css'
import './Section.css'

function VideoPage() {
  return (
    <div className="page-enter container section-page">
      <section className="hero">
        <h1 className="hero__title">{profile.tagline}</h1>
        <p className="quote hero__quote">&ldquo;{profile.intro}&rdquo;</p>
      </section>

      <header className="section-page__header">
        <span className="eyebrow">Works · Video</span>
        <h2 className="section-page__title">Video</h2>
        <p className="section-page__description">
          생성형 AI로 만든 영상 작업을 모았어요. 하나씩 채워 나갈 예정이에요.
        </p>
      </header>

      <div className="slot-grid">
        {videoSlots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} />
        ))}
      </div>
    </div>
  )
}

export default VideoPage
