import { useLanguage } from '../i18n/LanguageContext'
import './GameFrame.css'

// Games that ship with the site live in /public/games and are used as a result link ("/games/xxx.html").
export function isLocalGame(url) {
  return typeof url === 'string' && /^\/games\/[\w.\-]+\.html$/i.test(url)
}

function GameFrame({ src, title }) {
  const { t } = useLanguage()

  return (
    <div className="game-frame">
      <iframe
        className="game-frame__screen"
        src={src}
        title={title}
        // the games are single self-contained HTML files; scripts must run, nothing else is needed
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
      />
      <div className="game-frame__bar">
        <span>{t('assignments.gameHint')}</span>
        <a href={src} target="_blank" rel="noreferrer">
          {t('assignments.gameFull')}
        </a>
      </div>
    </div>
  )
}

export default GameFrame
