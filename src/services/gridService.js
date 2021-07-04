import { CHUNK_SIZE, TILE_SIZE, MINE_RATE, COORDS } from '../constants'
import { intHash, getChunkCoords, isWithinDistance } from '../utils'

export class GridService {
  constructor(scene) {
    this.scene = scene
  }

  init = () => {
    this.seed = 'seed'
    this.chunks = []
    this.state = {}
    this.last = {}
    this.tileOffset =
      this.scene.cameras.main.width / 2 - (TILE_SIZE * CHUNK_SIZE) / 2
    this.update()
  }

  update = (force) => {
    const { scrollX, scrollY, zoom } = this.scene.cameras.main
    const coords = getChunkCoords(scrollX, scrollY)
    if (!force && this.last.x === coords.x && this.last.y === coords.y) return
    this.last = coords

    const dist = Math.max(1, Math.round(1 / zoom + 1 / zoom / 2))
    for (let x = coords.x - dist; x <= coords.x + dist; x++) {
      for (let y = coords.y - dist; y <= coords.y + dist; y++) {
        this.getChunk(x, y)
      }
    }

    this.chunks.forEach((chunk) => {
      isWithinDistance(coords, chunk, dist)
        ? this.loadChunk(chunk)
        : this.unloadChunk(chunk)
    })
    this.tiles = this.chunks.map((c) => c.tiles.getChildren()).flat()
  }

  getChunk = (x, y) => {
    let chunk = this.chunks.find((c) => c.x === x && c.y === y)
    if (!chunk) {
      chunk = { x, y, tiles: this.scene.add.group() }
      this.chunks.push(chunk)
    }
    return chunk
  }

  loadChunk = (chunk) => {
    if (chunk.tiles.countActive() > 0) return

    for (let i = 0; i < CHUNK_SIZE; i++) {
      for (let j = 0; j < CHUNK_SIZE; j++) {
        const _x = i + chunk.x * CHUNK_SIZE
        const _y = j + chunk.y * CHUNK_SIZE
        chunk.tiles.add(this.loadTile(_x, _y))
      }
    }
  }

  unloadChunk = (chunk) => {
    if (chunk.tiles.countActive() === 0) return
    chunk.tiles.clear(true, true)
  }

  loadTile = (x, y) => {
    const sx = x * TILE_SIZE + this.tileOffset
    const sy = y * TILE_SIZE + this.tileOffset
    const frame = this.state[`${x}:${y}`]?.frame ?? 9
    const tile = this.scene.add.sprite(sx, sy, 'tiles', frame).setOrigin(0)
    tile.setInteractive().on('pointerup', () => this.onClickTile(x, y))
    tile._x = x
    tile._y = y
    return tile
  }

  onClickTile = (x, y) => {
    this.revealCount = 0
    this.revealTile(x, y)
    this.updateTiles()
  }

  updateTiles = () => {
    this.tiles.forEach((sprite) => {
      const frame = this.state[`${sprite._x}:${sprite._y}`]?.frame
      if (typeof frame === 'number') sprite.setFrame(frame)
    })
  }

  revealTile = (x, y) => {
    if (this.state[`${x}:${y}`]) return

    const frame = this.getIsMine(x, y) ? 10 : this.getMineCount(x, y)
    this.state[`${x}:${y}`] = { frame }

    if (frame === 0 && this.revealCount++ < 100000)
      COORDS.forEach(([i, j]) => this.revealTile(x + i, y + j))
  }

  getMineCount = (x, y) =>
    COORDS.reduce((n, [i, j]) => (this.getIsMine(x + i, y + j) ? n + 1 : n), 0)

  getIsMine = (x, y) => intHash(`${this.seed}-${x}-${y}`) % MINE_RATE === 0
}
