import { useGames } from '../hooks/useGames'
import { useLanguage } from '../i18n/LanguageContext'
import GameBlock from '../components/GameBlock'
import './Section.css'

function GamePage() {
  const { t } = useLanguage()
  const { status, games } = useGames()

  return (
    <div className="page-enter container section-page">
      <header className="section-page__header">
        <span className="eyebrow">{t('game.eyebrow')}</span>
        <h2 className="section-page__title">{t('game.title')}</h2>
        <p className="section-page__description">{t('game.description')}</p>
      </header>

      {status === 'loading' && <p className="status-message">{t('game.loading')}</p>}
      {status === 'empty' && <p className="status-message">{t('game.empty')}</p>}
      {status === 'error' && <p className="status-message status-message--error">{t('game.error')}</p>}
      {status === 'success' && (
        <div className="color-panel section-page__games">
          {games.map((game, i) => (
            <GameBlock
              key={game.id}
              game={{
                index: String(i + 1).padStart(2, '0'),
                title: game.title,
                synopsis: game.synopsis,
                videoImage: game.video_url,
                videoDescription: game.video_description,
                link: game.link_url,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default GamePage
