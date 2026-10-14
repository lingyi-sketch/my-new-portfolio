import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import SmartImage from './SmartImage'
import { FilePreview, LinkPreview, canEmbed, canPreviewFile } from './FilePreview'
import { ASSIGNMENT_KINDS } from '../lib/assignments'
import './AssignmentCard.css'

function PromptBlock({ content }) {
  const [open, setOpen] = useState(false)
  const isLong = content.length > 320

  return (
    <div className="assignment-card__prompt">
      <div className={`assignment-card__markdown${open || !isLong ? ' assignment-card__markdown--open' : ''}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {isLong && (
        <button type="button" className="assignment-card__toggle" onClick={() => setOpen((value) => !value)}>
          {open ? '접기' : '전체 보기'}
        </button>
      )}
    </div>
  )
}

function Media({ assignment }) {
  const { kind, title, image_url: imageUrl, file_url: fileUrl, link_url: linkUrl } = assignment

  if (kind === 'prompt') {
    return assignment.content ? <PromptBlock content={assignment.content} /> : null
  }

  if (kind === 'image') {
    return (
      <div className="assignment-card__media assignment-card__media--photo">
        <SmartImage src={imageUrl} alt={title} label={title} />
      </div>
    )
  }

  if (kind === 'document') {
    return fileUrl && canPreviewFile(fileUrl) ? (
      <div className="assignment-card__media assignment-card__media--doc">
        <FilePreview url={fileUrl} title={title} className="assignment-card__preview" />
      </div>
    ) : null
  }

  if (fileUrl && canPreviewFile(fileUrl)) {
    return (
      <div className="assignment-card__media assignment-card__media--wide">
        <FilePreview url={fileUrl} title={title} className="assignment-card__preview" />
      </div>
    )
  }

  if (linkUrl && canEmbed(linkUrl)) {
    return (
      <div className="assignment-card__media assignment-card__media--wide">
        <LinkPreview url={linkUrl} title={title} className="assignment-card__preview" />
      </div>
    )
  }

  return null
}

function AssignmentCard({ assignment }) {
  const kindLabel = ASSIGNMENT_KINDS.find((kind) => kind.key === assignment.kind)?.label ?? assignment.kind
  const openUrl = assignment.kind === 'game' || assignment.kind === 'video' ? assignment.link_url || assignment.file_url : assignment.file_url

  return (
    <article className="assignment-card">
      <span className="eyebrow">{kindLabel}</span>
      <h3 className="assignment-card__title">{assignment.title}</h3>
      {assignment.description && <p className="assignment-card__description">{assignment.description}</p>}
      <Media assignment={assignment} />
      {openUrl && (
        <a className="assignment-card__link" href={openUrl} target="_blank" rel="noreferrer">
          원본 열기 →
        </a>
      )}
    </article>
  )
}

export default AssignmentCard
