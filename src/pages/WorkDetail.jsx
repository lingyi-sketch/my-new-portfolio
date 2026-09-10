import { Link, useParams } from 'react-router-dom'
import { getWorkById } from '../data/works'
import SmartImage from '../components/SmartImage'
import './WorkDetail.css'

const CATEGORY_LABEL = {
  images: 'Images',
  videos: 'Videos',
  pages: 'Pages',
}

function WorkDetail() {
  const { id } = useParams()
  const work = getWorkById(id)

  if (!work) {
    return (
      <div className="page-enter container work-detail__missing">
        <p>작품을 찾을 수 없습니다.</p>
        <Link to="/" className="work-detail__back">
          ← Works 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="page-enter work-detail container">
      <Link to={`/${work.category === 'images' ? '' : work.category}`} className="work-detail__back">
        ← Works 목록으로
      </Link>

      <div className="work-detail__grid">
        <div className="work-detail__image">
          <SmartImage src={work.image} alt={work.title} label={work.title} hoverEffect={false} />
        </div>

        <div className="work-detail__info">
          <span className="eyebrow">
            {CATEGORY_LABEL[work.category]} · {work.index}
          </span>
          <h1 className="work-detail__title">{work.title}</h1>
          <p className="work-detail__english">
            {work.englishTitle} — {work.year}
          </p>
          <p className="quote work-detail__summary">{work.summary}</p>
          <p className="work-detail__description">{work.description}</p>
        </div>
      </div>
    </div>
  )
}

export default WorkDetail
