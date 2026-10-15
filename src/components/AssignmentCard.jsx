import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '../i18n/LanguageContext'
import SmartImage from './SmartImage'
import { FilePreview, UrlPreview, canEmbed, canPreviewFile } from './FilePreview'
import { ASSIGNMENT_KINDS } from '../lib/assignments'
import './AssignmentCard.css'

function PromptBlock({ content }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const isLong = content.length > 320

  return (
    <div className="assignment-card__prompt">
      <div className={`assignment-card__markdown${open || !isLong ? ' assignment-card__markdown--open' : ''}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {isLong && (
        <button type="button" className="assignment-card__toggle" onClick={() => setOpen((value) => !value)}>
          {open ? t('assignment.collapse') : t('assignment.expand')}
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

  if (linkUrl) {
    return (
      <UrlPreview
        url={linkUrl}
        title={title}
        mediaClassName="assignment-card__media assignment-card__media--wide"
        previewClassName="assignment-card__preview"
      />
    )
  }

  return null
}

function AssignmentCard({ assignment }) {
  const { t } = useLanguage()
  const kindLabel = ASSIGNMENT_KINDS.some((kind) => kind.key === assignment.kind)
    ? t(`assignment.kind.${assignment.kind}`)
    : assignment.kind
  const isLinkKind = assignment.kind === 'game' || assignment.kind === 'video'
  const linkShownAsCard =
    isLinkKind &&
    !(assignment.file_url && canPreviewFile(assignment.file_url)) &&
    Boolean(assignment.link_url) &&
    !canEmbed(assignment.link_url)
  const openUrl = isLinkKind && !linkShownAsCard ? assignment.link_url || assignment.file_url : assignment.file_url

  return (
    <article className="assignment-card">
      <span className="eyebrow">{kindLabel}</span>
      <h3 className="assignment-card__title">{assignment.title}</h3>
      {assignment.description && <p className="assignment-card__description">{assignment.description}</p>}
      <Media assignment={assignment} />
      {openUrl && (
        <a className="assignment-card__link" href={openUrl} target="_blank" rel="noreferrer">
          {t('common.openOriginal')}
        </a>
      )}
    </article>
  )
}

export default AssignmentCard
