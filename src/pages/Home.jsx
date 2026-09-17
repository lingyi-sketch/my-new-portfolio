import { profile } from '../data/works'
import { useProjects } from '../hooks/useProjects'
import ProjectsGrid from '../components/ProjectsGrid'
import './WorksPage.css'

function Home() {
  const { status, projects } = useProjects()

  return (
    <div className="page-enter works-page">
      <section className="hero container">
        <h1 className="hero__title">{profile.tagline}</h1>
        <p className="quote hero__quote">&ldquo;{profile.intro}&rdquo;</p>
      </section>

      <section className="works-page__header container">
        <span className="eyebrow">Works · Images</span>
        <h2 className="works-page__title">Images</h2>
        <p className="works-page__description">정지된 프레임으로 남긴 생성형 이미지 작업.</p>
      </section>

      <section className="container works-page__body">
        {status === 'loading' && (
          <p className="status-message">작품을 불러오는 중이에요…</p>
        )}
        {status === 'empty' && (
          <p className="status-message">아직 등록된 작품이 없어요. 곧 새로운 작업을 올릴게요.</p>
        )}
        {status === 'error' && (
          <p className="status-message status-message--error">
            작품을 불러오지 못했어요. 데이터베이스 연결을 확인한 뒤 다시 시도해 주세요.
          </p>
        )}
        {status === 'success' && <ProjectsGrid projects={projects} />}
      </section>
    </div>
  )
}

export default Home
