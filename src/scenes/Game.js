import { CameraService } from '../services/cameraService'
import { GridService } from '../services/gridService'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  init() {
    this.input.mouse.disableContextMenu()
    this.cameraService = new CameraService(this)
    this.gridService = new GridService(this)
  }

  create() {
    this.gridService.init()

    if (window.room) {
      room.onStateChange((state) => {
        this.gridService.sync(state.toJSON().tiles)
      })

      this.gridService.sync(room.state.toJSON().tiles)
      room.onLeave((code) => {
        if (code === 1000) localStorage.removeItem(room.id)
        window.room = null
      })
    }
  }

  update(time, delta) {
    this.cameraService.update(delta)
    this.gridService.update()
  }
}
