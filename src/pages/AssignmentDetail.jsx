import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useAssignments } from '../hooks/useAssignments'
import { useLanguage } from '../i18n/LanguageContext'
import { inDisplayOrder, formatEntryDate } from '../lib/assignments'
import SmartImage from '../components/SmartImage'
import { UrlPreview, canEmbed } from '../components/FilePreview'
import './Section.css'
import './AssignmentDetail.css'

function PromptBlock({ prompt }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  async function copy() {
    const text = prompt.content ?? ''
    let done = false
    try {
      await navigator.clipboard.writeText(text)
      done = true
    } catch {
      // Clipboard API can be blocked (permissions, insecure context): fall back to a hidden textarea.
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      try {
        done = document.execCommand('copy')
      } catch {
        done = false
      }
      area.remove()
    }
    if (done) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <section className="prompt-block">
      <header className="prompt-block__head">
        <span className="eyebrow">{t('assignments.prompt')}</span>
        <button type="button" className="prompt-block__copy" onClick={copy}>
          {copied ? t('assignments.copied') : t('assignments.copy')}
        </button>
      </header>
      {prompt.title && <h3 className="prompt-block__title">{prompt.title}</h3>}
      <pre className="prompt-block__content">{prompt.content}</pre>
    </section>
  )
}

function AssignmentDetail() {
  const { id } = useParams()
  const { t } = useLanguage()
  const { status, assignments, weekOrder } = useAssignments()

  const ordered = inDisplayOrder(assignments, weekOrder)
  const index = ordered.findIndex((item) => item.id === id)
  const assignment = ordered[index]
  const previous = index > 0 ? ordered[index - 1] : null
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null

  const back = (
    <Link className="assignment-detail__back" to="/assignments">
      ← {t('assignments.back')}
    </Link>
  )

  if (status === 'loading') {
    return (
      <div className="page-enter container section-page assignment-detail">
        {back}
        <p className="status-message">{t('assignments.loading')}</p>
      </div>
    )
  }
  if (status === 'error' || !assignment) {
    return (
      <div className="page-enter container section-page assignment-detail">
        {back}
        <p className="status-message status-message--error">
          {status === 'error' ? t('assignments.error') : t('assignments.notFound')}
        </p>
      </div>
    )
  }

  const meta = [t('assignments.week', { n: assignment.week }), assignment.course, formatEntryDate(assignment)]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="page-enter container section-page assignment-detail">
      {back}

      <article className="assignment-detail__article">
        <span className="eyebrow">{meta}</span>
        <h1 className="assignment-detail__title">{assignment.title}</h1>
        {assignment.description && <p className="assignment-detail__lead">{assignment.description}</p>}

        {assignment.cover_url && (
          <div className="assignment-detail__cover">
            <SmartImage src={assignment.cover_url} alt={assignment.title} label={assignment.title} color hoverEffect={false} />
          </div>
        )}

        {assignment.body && (
          <div className="markdown-body">
            <ReactMarkdown>{assignment.body}</ReactMarkdown>
          </div>
        )}

        {assignment.prompts.map((prompt, i) => (
          <PromptBlock key={i} prompt={prompt} />
        ))}

        {assignment.files.length > 0 && (
          <ul className="file-list">
            {assignment.files.map((file, i) => (
              <li key={i} className="file-list__item">
                <span className="eyebrow">{t('assignments.file')}</span>
                <span className="file-list__label">{file.label}</span>
                <a href={file.url} target="_blank" rel="noreferrer">
                  {t('assignments.open')}
                </a>
              </li>
            ))}
          </ul>
        )}

        {assignment.result_url && (
          <div className="assignment-detail__result">
            {canEmbed(assignment.result_url) && (
              <UrlPreview url={assignment.result_url} title={assignment.title} mediaClassName="assignment-detail__embed" previewClassName="" />
            )}
            <a className="assignment-detail__result-link" href={assignment.result_url} target="_blank" rel="noreferrer">
              {t('assignments.result')}
            </a>
          </div>
        )}
      </article>

      <nav className="assignment-detail__nav">
        {previous ? <Link to={`/assignments/${previous.id}`}>← {t('assignments.prev')}</Link> : <span />}
        <span className="assignment-detail__count">
          {index + 1} / {ordered.length}
        </span>
        {next ? <Link to={`/assignments/${next.id}`}>{t('assignments.next')} →</Link> : <span />}
      </nav>
    </div>
  )
}

export default AssignmentDetail
