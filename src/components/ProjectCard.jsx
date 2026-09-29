import SmartImage from './SmartImage'
import '../components/WorkCard.css'

function ProjectCard({ project, index }) {
  return (
    <div className="work-card">
      <div className="work-card__frame">
        <SmartImage src={project.image_url} alt={project.title} label={project.title} />
        <span className="work-card__index">{String(index).padStart(2, '0')}</span>
      </div>
      <div className="work-card__caption">
        <h3 className="work-card__title">{project.title}</h3>
        {project.description && <p className="work-card__summary">{project.description}</p>}
      </div>
    </div>
  )
}

export default ProjectCard
