import { useLanguage } from '../i18n/LanguageContext'
import './GameBlock.css'

function GameBlock({ game }) {
  const { t } = useLanguage()

  return (
    <section className="game-block">
      <div className="game-block__heading">
        <span className="eyebrow">{t('game.title')} · {game.index}</span>
        <h3 className="game-block__title">{game.title}</h3>
      </div>

      <div className="game-block__grid">
        <div className="game-panel">
          <span className="game-panel__label">{t('game.synopsis')}</span>
          <p className="game-panel__text">{game.synopsis || t('game.noSynopsis')}</p>
        </div>

        <div className="game-panel">
          <span className="game-panel__label">{t('game.video')}</span>
          <div className="game-panel__frame">
            {game.videoImage ? (
              <video
                className="game-panel__video"
                src={game.videoImage}
                controls
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="game-panel__placeholder">{t('game.videoPending')}</div>
            )}
          </div>
          <p className="game-panel__text">{game.videoDescription || t('game.noVideoDesc')}</p>
        </div>

        <div className="game-panel">
          <span className="game-panel__label">{t('game.link')}</span>
          {game.link ? (
            <a className="game-panel__link" href={game.link} target="_blank" rel="noreferrer">
              {t('game.go')}
            </a>
          ) : (
            <p className="game-panel__text">{t('game.noLink')}</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default GameBlock
