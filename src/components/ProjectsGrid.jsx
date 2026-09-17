import ProjectCard from './ProjectCard'
import './WorksGrid.css'

function ProjectsGrid({ projects }) {
  return (
    <div className="works-grid">
      {projects.map((project, i) => (
        <ProjectCard key={project.id} project={project} index={i + 1} />
      ))}
    </div>
  )
}

export default ProjectsGrid
