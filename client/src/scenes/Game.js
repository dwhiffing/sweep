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
  }

  create() {
    this.tileService.init()

    if (window.room) {
      const sendCursorEvent = throttle(
        (x, y) => window.room.send('Cursor', { x, y }),
        250,
      )
      this.input.on('pointermove', (p) => {
        const { scrollX, scrollY } = this.cameras.main
        sendCursorEvent(scrollX + p.x, scrollY + p.y)
      })
      const room = window.room
      const sync = (changes) => this.tileService.sync(changes)

      sync(room.state.toJSON())
      room.onStateChange((state) => sync(state.toJSON()))
      room.onLeave((code) => {
        if (code === 1000) localStorage.removeItem(room.id)
        window.room = null
      })
    }
  }

  update(time, delta) {
    this.cameraService.update(delta)
    this.tileService.update()
  }
}
