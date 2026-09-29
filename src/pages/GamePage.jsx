import { useGames } from '../hooks/useGames'
import GameBlock from '../components/GameBlock'
import './Section.css'

function GamePage() {
  const { status, games } = useGames()

  return (
    <div className="page-enter container section-page">
      <header className="section-page__header">
        <span className="eyebrow">Works · Game</span>
        <h2 className="section-page__title">Game</h2>
        <p className="section-page__description">생성형 AI를 활용한 게임 작업</p>
      </header>

      {status === 'loading' && <p className="status-message">게임을 불러오는 중이에요…</p>}
      {status === 'empty' && (
        <p className="status-message">아직 등록된 게임이 없어요. 곧 새로운 작업을 올릴게요.</p>
      )}
      {status === 'error' && (
        <p className="status-message status-message--error">
          게임을 불러오지 못했어요. 데이터베이스 연결을 확인한 뒤 다시 시도해 주세요.
        </p>
      )}
      {status === 'success' && (
        <div className="section-page__games">
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
