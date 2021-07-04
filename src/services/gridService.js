import md5 from 'md5'

export class GridService {
  constructor(scene) {
    this.scene = scene
  }

  init = () => {
    this.seed = 'seed'
    this.chunks = []
    this.clickedTiles = {}
    this.chunkSize = 7
    this.tileSize = 32
    this.mineRate = 18
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
    if (chunk.isLoaded) return
    chunk.isLoaded = true

    for (let i = 0; i < this.chunkSize; i++) {
      for (let j = 0; j < this.chunkSize; j++) {
        const _x = i + chunk.x * this.chunkSize
        const _y = j + chunk.y * this.chunkSize
        chunk.tiles.add(this.loadTile(_x, _y))
      }
    }
  }

  unloadChunk = (chunk) => {
    if (!chunk.isLoaded) return
    chunk.isLoaded = false

    chunk.tiles.clear(true, true)
  }

  getTile = (x, y) => this.tiles.find((t) => t._key === `${x}:${y}`)

  loadTile = (x, y) => {
    const frame = this.clickedTiles[`${x}:${y}`]?.frame ?? 9
    const width = this.scene.cameras.main.width
    const offset = width / 2 - (this.tileSize * this.chunkSize) / 2
    const tile = this.scene.add
      .sprite(
        x * this.tileSize + offset,
        y * this.tileSize + offset,
        'tiles',
        frame,
      )
      .setOrigin(0)
      .setInteractive()

    tile._x = x
    tile._y = y
    tile._key = `${x}:${y}`
    tile.isMine = this.getIsMine(x, y)
    tile.on('pointerup', () => this.revealTile(tile))

    tile.neighbours = {}
    tile.mineCount = 0
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        if (this.getIsMine(x + i, y + j)) tile.mineCount++
        tile.neighbours[`${x + i}-${y + j}`] = {
          getSprite: () => this.getTile(x + i, y + j),
        }
      }
    }

    return tile
  }

  revealTile = (sprite) => {
    if (sprite.frame.name !== 9) return

    sprite.setFrame(sprite.isMine ? 10 : sprite.mineCount)
    this.clickedTiles[sprite._key] = { frame: sprite.frame.name }

    if (sprite.mineCount === 0) this.revealTileNeighbours(sprite)
  }

  revealTileNeighbours = (parentSprite) => {
    // TODO: this should effect all tiles instead of just loaded chunks
    Object.values(parentSprite.neighbours).forEach((n) => {
      const sprite = n.getSprite()
      if (sprite?.frame.name === 9) this.revealTile(sprite)
    })
  }

  getChunkCoords = (n) =>
    (this.chunkSize *
      this.tileSize *
      Math.round(n / (this.chunkSize * this.tileSize))) /
    this.chunkSize /
    this.tileSize

  getIsMine = (x, y) =>
    integerHash(md5(`${this.seed}-${x}-${y}`)) % this.mineRate === 0
}

const integerHash = (string) =>
  string.split('').reduce((n, c) => (n * 31 * c.charCodeAt(0)) % 982451653, 7)
