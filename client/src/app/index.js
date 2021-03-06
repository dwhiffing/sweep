import { useState, useRef, useEffect, useCallback } from 'preact/hooks'
import { h } from 'preact'
import { Icon } from './Icon'
import { Window } from './Window'
import { ScorePanel } from './ScorePanel'

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
  const [face, setFace] = useState(0)
  const [scores, setScores] = useState([])

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
        if (key === 'scores') setScores(value)
        if (key === 'face') setFace(value)
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
    { name: 'Solo', image: './assets/images/icon.png', onClick: startGame },
    { name: 'Multi', image: './assets/images/icon.png', onClick: startLobby },
  ]

  const LOBBY_ICONS = [
    { name: name, image: './assets/images/icon.png', onClick: promptName },
    {
      name: 'Create game',
      image: './assets/images/icon.png',
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
              image: './assets/images/icon.png',
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
          <ScorePanel face={face} scoreRight={score} />
          <div className="container-inner">
            {scores.length > 0 && (
              <div className="scores">
                {scores.map((score) => (
                  <div className="score-row">
                    <div className="dot" style={{ background: score.color }} />
                    <p>
                      {score.name}: {score.score}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div id="sweeper" />
          </div>
        </div>
      </Window>
    </div>
  )
}

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
