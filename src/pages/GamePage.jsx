import { games } from '../data/works'
import GameBlock from '../components/GameBlock'
import './Section.css'

function GamePage() {
  return (
    <div className="page-enter container section-page">
      <header className="section-page__header">
        <span className="eyebrow">Works · Game</span>
        <h2 className="section-page__title">Game</h2>
        <p className="section-page__description">
          생성형 AI를 활용한 게임 작업이에요. 게임마다 개요·영상·링크를 정리했어요.
        </p>
      </header>

      <div className="section-page__games">
        {games.map((game) => (
          <GameBlock key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}

export default GamePage
