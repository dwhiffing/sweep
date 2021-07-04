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
  }

  update(time, delta) {
    this.cameraService.update(delta)
    this.gridService.update()
  }
}
