import { useProjects } from '../hooks/useProjects'
import { useLanguage } from '../i18n/LanguageContext'
import SlotCard from '../components/SlotCard'
import '../components/SlotGrid.css'
import './Section.css'

function VideoPage() {
  const { t } = useLanguage()
  const { status, projects } = useProjects('video')

  return (
    <div className="page-enter container section-page">
      <header className="section-page__header">
        <span className="eyebrow">{t('video.eyebrow')}</span>
        <h2 className="section-page__title">{t('video.title')}</h2>
      </header>

      {status === 'loading' && <p className="status-message">{t('video.loading')}</p>}
      {status === 'empty' && <p className="status-message">{t('video.empty')}</p>}
      {status === 'error' && <p className="status-message status-message--error">{t('video.error')}</p>}
      {status === 'success' && (
        <div className="color-panel">
          <div className="slot-grid">
            {projects.map((project, i) => (
              <SlotCard
                key={project.id}
                slot={{
                  index: String(i + 1).padStart(2, '0'),
                  title: project.title,
                  description: project.description,
                  image: project.image_url,
                  fileUrl: project.video_url,
                  fileLabel: t('video.fileLabel'),
                  landscape: true,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPage
