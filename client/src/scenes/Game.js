import { throttle } from 'lodash'
import { CameraService } from '../services/cameraService'
import { TileService } from '../services/tileService'
import { COLORS } from './UI'

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
      const cursorEvent = throttle((coord) => room.send('Cursor', coord), 250)
      this.input.on('pointermove', (p) => {
        const { scrollX, scrollY } = this.cameras.main
        cursorEvent({ x: scrollX + p.x, y: scrollY + p.y })
      })

      this.tileService.sync(room.state.toJSON())
      room.onStateChange((state) => this.tileService.sync(state.toJSON()))
      room.onLeave((code) => {
        if (code === 1000) localStorage.removeItem(room.id)
        window.room = null
      })
      room.onMessage('Move', (message) => {
        const [_, index, x, y, shouldMark] = message.split(':')
        const tile = this.tileService.tiles.find(
          (t) => t._x === +x && t._y === +y,
        )
        const color = COLORS[index]
        const mark = shouldMark === 'true'
        const value = this.tileService.sweeper.getScore(+x, +y, mark)
        this.tileService.showScoreText(tile.x, tile.y, value, color)
      })
    }
  }

  update(time, delta) {
    this.cameraService.update(delta)
    this.tileService.update()
  }
}
