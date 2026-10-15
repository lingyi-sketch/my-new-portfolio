import { useProjects } from '../hooks/useProjects'
import { useLanguage } from '../i18n/LanguageContext'
import ScriptCard from '../components/ScriptCard'
import '../components/SlotGrid.css'
import './Section.css'

function ScriptPage() {
  const { t } = useLanguage()
  const { status, projects } = useProjects('script')

  return (
    <div className="page-enter container section-page">
      <header className="section-page__header">
        <span className="eyebrow">{t('script.eyebrow')}</span>
        <h2 className="section-page__title">{t('script.title')}</h2>
      </header>

      {status === 'loading' && <p className="status-message">{t('script.loading')}</p>}
      {status === 'empty' && <p className="status-message">{t('script.empty')}</p>}
      {status === 'error' && <p className="status-message status-message--error">{t('script.error')}</p>}
      {status === 'success' && (
        <div className="slot-grid">
          {projects.map((project, i) => (
            <ScriptCard
              key={project.id}
              slot={{
                index: String(i + 1).padStart(2, '0'),
                title: project.title,
                description: project.description,
                image: project.image_url,
                fileUrl: project.video_url,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ScriptPage
