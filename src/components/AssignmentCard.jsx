import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import SmartImage from './SmartImage'
import './AssignmentCard.css'

function AssignmentCard({ assignment }) {
  const { t } = useLanguage()
  const meta = assignment.course

  return (
    <article className="assignment-card">
      <Link className="assignment-card__body" to={`/assignments/${assignment.id}`}>
        {assignment.cover_url && (
          <div className="assignment-card__cover">
            <SmartImage src={assignment.cover_url} alt={assignment.title} label={assignment.title} color hoverEffect={false} />
          </div>
        )}
        {meta && <span className="eyebrow">{meta}</span>}
        <h3 className="assignment-card__title">{assignment.title}</h3>
        {assignment.description && <p className="assignment-card__description">{assignment.description}</p>}
        <span className="assignment-card__more">{t('assignments.read')}</span>
      </Link>
    </article>
  )
}

export default AssignmentCard
