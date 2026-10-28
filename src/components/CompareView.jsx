import ReactMarkdown from 'react-markdown'
import GameFrame, { isLocalGame } from './GameFrame'
import { useLanguage } from '../i18n/LanguageContext'
import './CompareView.css'

function Side({ side, fallbackLabel, title }) {
  const { t } = useLanguage()

  return (
    <section className="compare__side">
      <h3 className="compare__label">{side.label || fallbackLabel}</h3>

      {side.body && (
        <div className="markdown-body compare__body">
          <ReactMarkdown>{side.body}</ReactMarkdown>
        </div>
      )}

      {isLocalGame(side.game_url) && <GameFrame src={side.game_url} title={`${title} — ${side.label || fallbackLabel}`} />}

      {side.images.length > 0 && (
        <div className="compare__images">
          {side.images.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              <img src={url} alt="" loading="lazy" />
            </a>
          ))}
        </div>
      )}

      {side.files.length > 0 && (
        <ul className="file-list">
          {side.files.map((file, i) => (
            <li key={i} className="file-list__item">
              <span className="file-list__label">{file.label}</span>
              <a href={file.url} target="_blank" rel="noreferrer">
                {t('assignments.open')}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Two columns (before / after, A / B) that visitors can read side by side; stacked on small screens.
function CompareView({ compare, title }) {
  return (
    <div className="compare">
      <Side side={compare.left} fallbackLabel="A" title={title} />
      <span className="compare__vs" aria-hidden="true">
        VS
      </span>
      <Side side={compare.right} fallbackLabel="B" title={title} />
    </div>
  )
}

export default CompareView
