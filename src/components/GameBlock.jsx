import SmartImage from './SmartImage'
import './GameBlock.css'

function GameBlock({ game }) {
  return (
    <section className="game-block">
      <div className="game-block__heading">
        <span className="eyebrow">Game · {game.index}</span>
        <h3 className="game-block__title">{game.title}</h3>
      </div>

      <div className="game-block__grid">
        <div className="game-panel">
          <span className="game-panel__label">게임 개요</span>
          <p className="game-panel__text">
            {game.synopsis || '아직 개요가 없어요. 등록되면 이 자리에 표시돼요.'}
          </p>
        </div>

        <div className="game-panel">
          <span className="game-panel__label">게임 영상</span>
          <div className="game-panel__frame">
            <SmartImage src={game.videoImage} alt={`${game.title} 영상`} label="영상 준비 중" />
          </div>
          <p className="game-panel__text">
            {game.videoDescription || '아직 영상 소개가 없어요.'}
          </p>
        </div>

        <div className="game-panel">
          <span className="game-panel__label">게임 링크</span>
          {game.link ? (
            <a className="game-panel__link" href={game.link} target="_blank" rel="noreferrer">
              바로가기 →
            </a>
          ) : (
            <p className="game-panel__text">아직 링크가 없어요.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default GameBlock
