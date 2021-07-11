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
    this.cursorText = this.add.text(0, 0, '0,0').setScrollFactor(0)
    this.input.on('pointermove', (p) => {
      this.cursorText.setPosition(p.x + 10, p.y + 10)
    })

    if (window.room) {
      const room = window.room
      const sync = (changes) => {
        this.tileService.sync(changes)
        const playerId = localStorage.getItem(room.id)
        const player = changes.players.find((p) => p.id === playerId)
        player && this.registry.set('score', player.score)
      }
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
