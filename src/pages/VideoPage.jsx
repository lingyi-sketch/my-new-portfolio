import { profile } from '../data/works'
import { useProjects } from '../hooks/useProjects'
import SlotCard from '../components/SlotCard'
import '../components/SlotGrid.css'
import './Section.css'

function VideoPage() {
  const { status, projects } = useProjects('video')

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

      {status === 'loading' && <p className="status-message">영상을 불러오는 중이에요…</p>}
      {status === 'empty' && (
        <p className="status-message">아직 등록된 영상이 없어요. 곧 새로운 작업을 올릴게요.</p>
      )}
      {status === 'error' && (
        <p className="status-message status-message--error">
          영상을 불러오지 못했어요. 데이터베이스 연결을 확인한 뒤 다시 시도해 주세요.
        </p>
      )}
      {status === 'success' && (
        <div className="slot-grid">
          {projects.map((project, i) => (
            <SlotCard
              key={project.id}
              slot={{
                index: String(i + 1).padStart(2, '0'),
                title: project.title,
                description: project.description,
                image: project.image_url,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default VideoPage
