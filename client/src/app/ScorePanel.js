import { h } from 'preact'

export const ScorePanel = ({ scoreLeft, scoreRight = 0 }) => (
  <div className="score-area">
    <ScoreText score={scoreLeft} />
    <button className="face-button">
      <Face value={0} />
    </button>
    <ScoreText score={scoreRight} />
  </div>
)

const ScoreText = ({ score = '' }) => (
  <div className="text">
    {score
      .toString()
      .padStart(10, '-')
      .split('')
      .map((value, i) => (
        <ScoreNumber key={`${value}-${i}`} value={+value} />
      ))}
  </div>
)

const ScoreNumber = ({ value }) => (
  <Sprite frameWidth={13} src="./assets/images/numbers.png" frame={value + 1} />
)

const Face = ({ value }) => (
  <Sprite frameWidth={17} src="./assets/images/faces.png" frame={value} />
)

const Sprite = ({ src, frameWidth, frame }) => (
  <div
    style={{
      overflow: 'hidden',
      width: frameWidth,
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <img
      src={src}
      style={{ position: 'relative', left: -frameWidth * frame }}
    />
  </div>
)
