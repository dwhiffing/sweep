import md5 from 'md5'
const chunkSize = 7
const tileSize = 32
const mineRate = 18

export class GridService {
  constructor(scene) {
    this.scene = scene
  }

  init = () => {
    this.seed = 'seed'
    this.chunks = []
    this.clickedTiles = {}
    this.update()
  }

  update = () => {
    const { scrollX, scrollY, zoom } = this.scene.cameras.main
    const cX = this.getChunkCoords(scrollX)
    const cY = this.getChunkCoords(scrollY)
    if (this._x === cX && this._y === cY) return
    this._x = cX
    this._y = cY

    const drawDist = zoom === 1 ? 2 : 3
    for (let x = cX - drawDist; x <= cX + drawDist; x++) {
      for (let y = cY - drawDist; y <= cY + drawDist; y++) {
        this.getChunk(x, y)
      }
    }

    this.chunks.forEach((chunk) => {
      const isVisible =
        Math.abs(cX - chunk.x) <= drawDist && Math.abs(cY - chunk.y) <= drawDist
      if (isVisible) {
        this.loadChunk(chunk)
      } else {
        this.unloadChunk(chunk)
      }
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

    for (let i = 0; i < chunkSize; i++) {
      for (let j = 0; j < chunkSize; j++) {
        const _x = i + chunk.x * chunkSize
        const _y = j + chunk.y * chunkSize
        chunk.tiles.add(this.loadTile(_x, _y))
      }
    }
  }

  unloadChunk = (chunk) => {
    if (chunk.tiles.countActive() === 0) return

    chunk.tiles.clear(true, true)
  }

  getTile = (x, y) => this.tiles.find((t) => t._key === `${x}:${y}`)

  loadTile = (x, y) => {
    const frame = this.clickedTiles[`${x}:${y}`]?.frame ?? 9
    const width = this.scene.cameras.main.width
    const o = width / 2 - (tileSize * chunkSize) / 2
    const tile = this.scene.add
      .sprite(x * tileSize + o, y * tileSize + o, 'tiles', frame)
      .setOrigin(0)
      .setInteractive()

    tile._x = x
    tile._y = y
    tile._key = `${x}:${y}`
    tile.on('pointerup', () => this.revealTile(tile))

    return tile
  }

  revealTile = (sprite) => {
    if (sprite?.frame.name !== 9) return

    const { _x: x, _y: y } = sprite
    const frame = this.getIsMine(x, y) ? 10 : this.getMineCount(x, y)
    sprite.setFrame(frame)
    this.clickedTiles[sprite._key] = { frame }

    if (frame === 0) this.revealTileNeighbours(sprite)
  }

  revealTileNeighbours = (parentSprite) => {
    // TODO: this should effect all tiles instead of just loaded chunks
    N_COORDS.forEach(([i, j]) => {
      const sprite = this.getTile(parentSprite._x + i, parentSprite._y + j)
      if (sprite?.frame.name === 9) this.revealTile(sprite)
    })
  }

  getChunkCoords = (n) =>
    (chunkSize * tileSize * Math.round(n / (chunkSize * tileSize))) /
    chunkSize /
    tileSize

  getMineCount = (x, y) =>
    N_COORDS.reduce(
      (n, [i, j]) => (this.getIsMine(x + i, y + j) ? n + 1 : n),
      0,
    )

  getIsMine = (x, y) =>
    integerHash(md5(`${this.seed}-${x}-${y}`)) % mineRate === 0
}

const integerHash = (string) =>
  string.split('').reduce((n, c) => (n * 31 * c.charCodeAt(0)) % 982451653, 7)

const N_COORDS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
]
