export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' })
  }

  create() {
    const server = window.colyseus
    this.autoConnectAttempted = false
    let roomButtons = []
    const name = getStorage('name') || 'name'

    const enterRoom = (room) => {
      if (!room) return
      setStorage('name', name)
      setStorage(room.id, room.sessionId)
      window.room = room
      this.scene.start('Game')
    }

    const createRoom = async () => {
      const roomName = prompt('Room name?')
      if (!roomName) return

      const room = await server.create('online-minesweeper', { roomName, name })
      enterRoom(room)
    }

    const joinRoom = async (roomId) => {
      let room
      if (getStorage(roomId)) {
        room = await server.reconnect(roomId, getStorage(roomId))
      } else {
        room = await server.joinById(roomId)
      }
      enterRoom(room)
    }

    const update = async () => {
      const rooms = await server.getAvailableRooms()

      const lastRoom = rooms.find((room) => getStorage(room.roomId))
      if (lastRoom && !this.autoConnectAttempted) {
        this.autoConnectAttempted = true
        joinRoom(lastRoom.roomId, name)
      }

      roomButtons.forEach((b) => b.destroy())
      roomButtons = rooms.map((room, i) =>
        this.addButton(width / 2 + 64, height / 2 - i * 32, 11, () =>
          joinRoom(room.roomId),
        ),
      )
    }
    update()
    this.time.addEvent({ delay: 1000, callback: update, loop: true })

    const localGame = () => this.scene.start('Game')

    const { width, height } = this.cameras.main
    this.addButton(width / 2 - 64, height / 2, 11, localGame)
    this.addButton(width / 2, height / 2, 13, createRoom)
  }

  addButton = (x, y, frame, onClick) => {
    this.add
      .image(x, y, 'tiles', frame)
      .setInteractive()
      .setOrigin(0.5)
      .on('pointerup', onClick)
  }
}

const getStorage = (key) => localStorage.getItem(key)

const setStorage = (key, value) => localStorage.setItem(key, value)
