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
    this.cursorText = this.add
      .text(0, 0, '0,0', { color: '#000', fontFamily: 'Arial', fontSize: 12 })
      .setScrollFactor(0)
      .setOrigin(1, 1)
    this.cursor = this.add
      .sprite(0, 0, 'cursor')
      .setScale(2)
      .setScrollFactor(0)
      .setOrigin(0, 0)
    this.input.on('pointermove', (p) => {
      this.cursor.setPosition(p.x, p.y)
      this.cursorText.setPosition(p.x, p.y)
    })

    if (window.room) {
      const room = window.room
      const sync = (changes) => {
        this.tileService.sync(changes)
        const playerId = localStorage.getItem(room.id)
        const player = changes.players.find((p) => p.id === playerId)
        if (player) {
          this.registry.set('score', player.score)
          this.cursor.setTint(player.color)
        }
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
