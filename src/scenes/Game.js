import { Chunk } from '../gameObjects/Chunk'
export const chunkSize = 4
export const tileSize = 32
export const fullSize = chunkSize * tileSize
export const drawDist = 2

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  init() {
    this.width = this.cameras.main.width
    this.height = this.cameras.main.height
  }

  create() {
    this.chunks = []
    this.clickedTiles = {}
    this.updateChunks()

    this.cameras.main.setZoom(1)
    const { W, A, S, D, Q, E } = Phaser.Input.Keyboard.KeyCodes
    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
      camera: this.cameras.main,
      left: this.input.keyboard.addKey(A),
      right: this.input.keyboard.addKey(D),
      up: this.input.keyboard.addKey(W),
      down: this.input.keyboard.addKey(S),
      zoomIn: this.input.keyboard.addKey(Q),
      zoomOut: this.input.keyboard.addKey(E),
      acceleration: 0.1,
      drag: 0.005,
      maxSpeed: 0.3,
    })
  }

  update(time, delta) {
    this.controls.update(delta)
    this.updateChunks()
  }

  getChunk(x, y) {
    let chunk = this.chunks.find((c) => c.x === x && c.y === y)
    if (!chunk) {
      chunk = new Chunk(this, x, y)
      this.chunks.push(chunk)
    }
    return chunk
  }

  getChunkCoords = (x) =>
    (fullSize * Math.round(x / fullSize)) / chunkSize / tileSize

  updateChunks = () => {
    const { scrollX, scrollY, centerX, centerY } = this.cameras.main
    if (this._x === scrollX + centerX && this._y === scrollY + centerY) return
    this._x = scrollX + centerX
    this._y = scrollY + centerY

    const cX = this.getChunkCoords(this._x)
    const cY = this.getChunkCoords(this._y)

    for (let x = cX - drawDist; x < cX + drawDist; x++) {
      for (let y = cY - drawDist; y < cY + drawDist; y++) {
        this.getChunk(x, y)
      }
    }

    this.chunks.forEach((chunk) => {
      const isVisible =
        Math.abs(cX - chunk.x) <= drawDist && Math.abs(cY - chunk.y) <= drawDist
      if (isVisible) chunk.load()
      else chunk.unload()
    })
  }
}
