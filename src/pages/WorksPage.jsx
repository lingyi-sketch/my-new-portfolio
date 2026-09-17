import { getWorksByCategory } from '../data/works'
import WorksGrid from '../components/WorksGrid'
import './WorksPage.css'

const COPY = {
  videos: {
    eyebrow: 'Works · Videos',
    title: 'Videos',
    description: '움직임과 서사를 실험하는 생성형 영상 작업.',
  },
  pages: {
    eyebrow: 'Works · Pages',
    title: 'Pages',
    description: '텍스트와 이미지가 함께 놓이는 에디토리얼 지면 작업.',
  },
}

function WorksPage({ category }) {
  const works = getWorksByCategory(category)
  const copy = COPY[category]

  return (
    <div className="page-enter works-page">
      <section className="works-page__header container">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h2 className="works-page__title">{copy.title}</h2>
        <p className="works-page__description">{copy.description}</p>
      </section>

      <section className="container works-page__body">
        <WorksGrid works={works} />
      </section>
    </div>
  )
}

export default WorksPage
