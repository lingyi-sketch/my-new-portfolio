import SmartImage from './SmartImage'
import '../components/WorkCard.css'

function ProjectCard({ project, index }) {
  const isAlt = index % 2 === 0

  return (
    <div className={`work-card${isAlt ? ' work-card--alt' : ''}`}>
      <div className="work-card__frame">
        <SmartImage src={project.image_url} alt={project.title} label={project.title} />
      </div>
      <span className="work-card__index">{String(index).padStart(2, '0')}</span>
      <div className="work-card__caption">
        <h3 className="work-card__title">{project.title}</h3>
        {project.description && <p className="work-card__summary">{project.description}</p>}
      </div>
    </div>
  )
}

export default ProjectCard
