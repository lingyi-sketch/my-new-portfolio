import { Link } from 'react-router-dom'
import SmartImage from './SmartImage'
import './WorkCard.css'

function WorkCard({ work }) {
  const isAlt = Number(work.index) % 2 === 0

  return (
    <Link to={`/work/${work.id}`} className={`work-card${isAlt ? ' work-card--alt' : ''}`}>
      <div className="work-card__frame">
        <SmartImage src={work.image} alt={work.title} label={work.title} />
      </div>
      <span className="work-card__index">{work.index}</span>
      <div className="work-card__caption">
        <h3 className="work-card__title">{work.title}</h3>
        <p className="work-card__summary">{work.summary}</p>
      </div>
    </Link>
  )
}

export default WorkCard
