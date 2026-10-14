import { useAssignments } from '../hooks/useAssignments'
import AssignmentCard from '../components/AssignmentCard'
import './Section.css'
import './AssignmentsPage.css'

function groupByWeek(assignments) {
  const weeks = new Map()
  for (const assignment of assignments) {
    if (!weeks.has(assignment.week)) weeks.set(assignment.week, [])
    weeks.get(assignment.week).push(assignment)
  }
  return Array.from(weeks.entries())
}

function AssignmentsPage() {
  const { status, assignments } = useAssignments()

  return (
    <div className="page-enter container section-page">
      <header className="section-page__header">
        <span className="eyebrow">Weekly</span>
        <h2 className="section-page__title">과제</h2>
      </header>

      {status === 'loading' && <p className="status-message">과제를 불러오는 중이에요…</p>}
      {status === 'empty' && (
        <p className="status-message">아직 등록된 과제가 없어요. 곧 새로운 과제를 올릴게요.</p>
      )}
      {status === 'error' && (
        <p className="status-message status-message--error">
          과제를 불러오지 못했어요. 데이터베이스 연결을 확인한 뒤 다시 시도해 주세요.
        </p>
      )}
      {status === 'success' && (
        <div className="weeks">
          {groupByWeek(assignments).map(([week, items]) => (
            <section key={week} className="week-block">
              <h3 className="week-block__title">{week}주차</h3>
              <div className="week-block__grid">
                {items.map((assignment) => (
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
