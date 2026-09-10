import { Link } from 'react-router-dom'
import SmartImage from './SmartImage'
import './WorkCard.css'

function WorkCard({ work }) {
  return (
    <Link to={`/work/${work.id}`} className={`work-card work-card--${work.size}`}>
      <div className="work-card__frame">
        <SmartImage src={work.image} alt={work.title} label={work.title} />
        <span className="work-card__index">{work.index}</span>
      </div>
      <div className="work-card__caption">
        <h3 className="work-card__title">{work.title}</h3>
        <p className="work-card__summary">{work.summary}</p>
      </div>
    </Link>
  )
}

export default WorkCard
