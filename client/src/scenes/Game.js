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
      const room = window.room
      room.onStateChange((state) => {
        this.tileService.sync(state.toJSON().tiles)
      })
      this.tileService.sync(room.state.toJSON().tiles)
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
