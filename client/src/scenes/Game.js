import { throttle } from 'lodash'
import { CameraService } from '../services/cameraService'
import { TileService } from '../services/tileService'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  init() {
    this.input.mouse.disableContextMenu()
    this.cameraService = new CameraService(this)
    this.tileService = new TileService(this)
    this.registry.set('score', 0)
    this.registry.set('face', 0)
  }

  create() {
    this.tileService.init()

    if (window.room) {
      const room = window.room
      const cursorEvent = throttle((coord) => room.send('Cursor', coord), 250)
      this.input.on('pointermove', (p) =>
        cursorEvent({ x: p.worldX, y: p.worldY }),
      )

      this.tileService.sync(room.state.toJSON())
      room.onStateChange((state) => this.tileService.sync(state.toJSON()))
      room.onLeave((code) => {
        if (code === 1000) localStorage.removeItem(room.id)
        window.room = null
      })
      room.onMessage('Move', (message) => {
        const [index, x, y, mark] = message.split(':')
        this.tileService.onMove(index, +x, +y, mark === 'true')
      })
      room.onMessage('Cursor', (message) => {
        const [id, index, x, y] = message.split(':')
        this.tileService.updateCursor(id, +index, +x, +y)
      })
    }
  }

  update(time, delta) {
    this.cameraService.update(delta)
    this.tileService.update()
  }
}
