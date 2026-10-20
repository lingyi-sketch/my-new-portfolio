import { useAssignments } from '../hooks/useAssignments'
import { useMasonry } from '../hooks/useMasonry'
import { useLanguage } from '../i18n/LanguageContext'
import { orderWeeks } from '../lib/weekOrder'
import { groupByWeek } from '../lib/assignments'
import AssignmentCard from '../components/AssignmentCard'
import './Section.css'
import './AssignmentsPage.css'

function AssignmentsPage() {
  const { t } = useLanguage()
  const { status, assignments, weekOrder } = useAssignments()

  const groups = groupByWeek(assignments)
  const orderedWeeks = orderWeeks([...groups.keys()], weekOrder)
  const weeksRef = useMasonry(orderedWeeks.join(','))

  return (
    <div className="page-enter container section-page">
      <header className="section-page__header">
        <span className="eyebrow">{t('assignments.eyebrow')}</span>
        <h2 className="section-page__title">{t('assignments.title')}</h2>
      </header>

      {status === 'loading' && <p className="status-message">{t('assignments.loading')}</p>}
      {status === 'empty' && <p className="status-message">{t('assignments.empty')}</p>}
      {status === 'error' && <p className="status-message status-message--error">{t('assignments.error')}</p>}
      {status === 'success' && (
        <div className="weeks" ref={weeksRef}>
          {orderedWeeks.map((week) => (
            <section key={week} className="week-block">
              <h3 className="week-block__title">{t('assignments.week', { n: week })}</h3>
              <div className="week-block__grid">
                {groups.get(week).map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default AssignmentsPage
