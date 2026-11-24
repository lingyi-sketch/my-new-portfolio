import { useLanguage } from '../i18n/LanguageContext'
import './GameFrame.css'

// Pages that ship with the site and can be shown inside an assignment as a result link:
//   /games/xxx.html   playable games (scripts allowed)
//   /embeds/xxx.html  static pages such as a generated report (scripts turned off)
export function isLocalGame(url) {
  return typeof url === 'string' && /^\/(games|embeds)\/[\w.\-]+\.html$/i.test(url)
}

function GameFrame({ src, title }) {
  const { t } = useLanguage()
  const isStaticPage = src.startsWith('/embeds/')

  return (
    <div className="game-frame">
      <iframe
        className={`game-frame__screen${isStaticPage ? ' game-frame__screen--page' : ''}`}
        src={src}
        title={title}
        // games are single self-contained HTML files and need scripts; static pages need nothing
        sandbox={isStaticPage ? 'allow-same-origin' : 'allow-scripts allow-same-origin'}
        loading="lazy"
      />
      <div className="game-frame__bar">
        <span>{t(isStaticPage ? 'assignments.embedHint' : 'assignments.gameHint')}</span>
        <a href={src} target="_blank" rel="noreferrer">
          {t(isStaticPage ? 'assignments.embedFull' : 'assignments.gameFull')}
        </a>
      </div>
    </div>
  )
}

export default GameFrame
