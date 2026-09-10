import WorkCard from './WorkCard'
import './WorksGrid.css'

function WorksGrid({ works }) {
  return (
    <div className="works-grid">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </div>
  )
}

export default WorksGrid
