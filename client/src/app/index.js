import { useState, useRef, useEffect, useCallback } from 'preact/hooks'
import { h } from 'preact'
import { Icon } from './Icon'

export const App = ({ config }) => {
  const gameRef = useRef(false)
  const [game, setGame] = useState(false)
  const [lobby, setLobby] = useState(false)
  const [selected, setSelected] = useState(null)

  const intervalRef = useRef()
  const autoConnectAttempted = useRef(false)
  const [availableRooms, setAvailableRooms] = useState([])
  const defaultName = localStorage.getItem('name')
  const [name, setName] = useState(defaultName || 'Player')
  const [score, setScore] = useState(0)

  const onCreateRoom = (name) => {
    createRoom(name)
    startGame()
  }

  const onJoinRoom = (roomId, name) => joinRoom(roomId, name, () => startGame())

  useEffect(() => {
    const deselect = (e) => {
      if (!e.target.className.includes('icon')) setSelected(null)
    }
    const getAvailableRooms = async () =>
      setAvailableRooms(await window.colyseus.getAvailableRooms())
    getAvailableRooms()

    intervalRef.current = setInterval(getAvailableRooms, 3000)
    window.addEventListener('pointerdown', deselect)
    return () => {
      clearInterval(intervalRef.current)
      window.removeEventListener('pointerdown', deselect)
    }
  }, [])

  useEffect(() => {
    if (!availableRooms || window.room) return
    const lastRoom = availableRooms.find((room) =>
      localStorage.getItem(room.roomId),
    )

    if (lastRoom && !autoConnectAttempted.current) {
      autoConnectAttempted.current = true
      onJoinRoom(lastRoom.roomId, name)
    }
  }, [availableRooms, onJoinRoom, name])

  useEffect(() => {
    if (game && !gameRef.current) {
      const game = new Phaser.Game(config)
      gameRef.current = game
      game.registry.events.on('changedata', (_, key, value) => {
        if (key === 'score') setScore(value)
      })
    }
  }, [game])

  const getOnClickIcon = (name) => () =>
    setSelected(selected !== name ? name : null)

  const startGame = () => {
    setSelected(null)
    setGame(true)
    closeLobby()
  }

  const startLobby = () => {
    setSelected(null)
    setLobby(true)
    closeGame()
  }

  const closeLobby = () => {
    setLobby(null)
  }

  const closeGame = () => {
    gameRef.current?.scene?.getScene('Game').sys.game.destroy(true)
    gameRef.current = null
    window.room?.leave()
    window.room = null
    setGame(null)
  }

  const promptName = () => {
    const name = prompt('Enter name')
    localStorage.setItem('name', name)
    setName(name)
  }

  const ICONS = [
    { name: 'Solo', image: 'icon.png', onClick: startGame },
    { name: 'Multi', image: 'icon.png', onClick: startLobby },
  ]

  const LOBBY_ICONS = [
    { name: name, image: 'icon.png', onClick: promptName },
    {
      name: 'Create game',
      image: 'icon.png',
      onClick: () => onCreateRoom(name),
    },
  ]

  return (
    <div>
      <div className="desktop">
        {ICONS.map((icon) => (
          <Icon
            label={icon.name}
            image={icon.image}
            selected={selected === icon.name}
            onClick={getOnClickIcon(icon.name)}
            onDoubleClick={icon.onClick}
          />
        ))}
      </div>

      <Window
        className="lobby"
        title="Lobby"
        active={lobby}
        onClose={closeLobby}
      >
        <div class="window-icons">
          {[
            ...LOBBY_ICONS,
            ...availableRooms.map((room) => ({
              name: room.metadata.roomName || room.roomId,
              image: 'icon.png',
              onClick: () => onJoinRoom(room.roomId, name),
            })),
          ].map((icon) => (
            <Icon
              label={icon.name}
              image={icon.image}
              selected={selected === icon.name}
              onClick={getOnClickIcon(icon.name)}
              onDoubleClick={icon.onClick}
              textColor="black"
            />
          ))}
        </div>
      </Window>

      <Window title="Minesweeper" active={game} onClose={closeGame}>
        <div className="container">
          <Score scoreLeft={score} />
          <div className="container-inner">
            <div id="sweeper" />
          </div>
        </div>
      </Window>
    </div>
  )
}

const Score = ({ scoreLeft = 0, scoreRight = 0 }) => (
  <div className="score-area">
    <ScoreText score={scoreLeft} />
    <button className="face-button">
      <Face value={0} />
    </button>
    <ScoreText score={scoreRight} />
  </div>
)

const ScoreText = ({ score = 0 }) => (
  <div className="text">
    {score
      .toString()
      .padStart(10, '-')
      .split('')
      .map((value, i) => (
        <ScoreNumber key={i} value={+value} />
      ))}
  </div>
)

const ScoreNumber = ({ value }) => (
  <Sprite frameWidth={13} src="./numbers.png" frame={value + 1} />
)

const Face = ({ value }) => (
  <Sprite frameWidth={17} src="./faces.png" frame={value} />
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

const Window = ({ active, title, onClose, children, className = '' }) => (
  <div class={`window ${active ? '' : 'hidden'} ${className}`}>
    <div class="title-bar">
      <div class="title-bar-text">
        <img src="./icon.png" />
        {title}
      </div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button onClick={onClose} aria-label="Close"></button>
      </div>
    </div>
    {children}
  </div>
)

const createRoom = async (name) => {
  const roomName = prompt('Room name?')
  if (!roomName) return

  const room = await window.colyseus.create('online-minesweeper', {
    roomName,
    name,
  })
  localStorage.setItem(room.id, room.sessionId)
  window.room = room
}

const joinRoom = async (roomId, name, onJoin) => {
  try {
    const room = await joinRoomWithReconnect(roomId, name)
    if (!room) throw new Error('Failed to join room')
    localStorage.setItem(room.id, room.sessionId)
    window.room = room
    onJoin()
  } catch (e) {
    alert(e)
    localStorage.removeItem(roomId)
  }
}

const joinRoomWithReconnect = async (roomId, name) => {
  let room,
    sessionId = localStorage.getItem(roomId)
  if (sessionId) {
    try {
      room = await window.colyseus.reconnect(roomId, sessionId)
    } catch (e) {}
  } else {
    room = room || (await window.colyseus.joinById(roomId, { name }))
  }

  return room
}
