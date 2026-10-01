import { useProjects } from '../hooks/useProjects'
import SlotCard from '../components/SlotCard'
import '../components/SlotGrid.css'
import './Section.css'

function ScriptPage() {
  const { status, projects } = useProjects('script')

  return (
    <div className="page-enter container section-page">
      <header className="section-page__header">
        <span className="eyebrow">Works · Script</span>
        <h2 className="section-page__title">Script</h2>
      </header>

      {status === 'loading' && <p className="status-message">대본을 불러오는 중이에요…</p>}
      {status === 'empty' && (
        <p className="status-message">아직 등록된 대본이 없어요. 곧 새로운 작업을 올릴게요.</p>
      )}
      {status === 'error' && (
        <p className="status-message status-message--error">
          대본을 불러오지 못했어요. 데이터베이스 연결을 확인한 뒤 다시 시도해 주세요.
        </p>
      )}
      {status === 'success' && (
        <div className="slot-grid slot-grid--dense">
          {projects.map((project, i) => (
            <SlotCard
              key={project.id}
              slot={{
                index: String(i + 1).padStart(2, '0'),
                title: project.title,
                description: project.description,
                image: project.image_url,
                fileUrl: project.video_url,
                fileLabel: '대본 파일 보기',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ScriptPage
