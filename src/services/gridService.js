import md5 from 'md5'

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
    const { scrollX, scrollY, centerX, centerY } = this.scene.cameras.main
    // TODO: should make this faster by only updating chunks when moving camera a certain distance
    const tX = scrollX + centerX
    const tY = scrollY + centerY
    if (this._x === tX && this._y === tY) return
    this._x = tX
    this._y = tY

    const cX = getChunkCoords(this._x)
    const cY = getChunkCoords(this._y)

    for (let x = cX - drawDist; x < cX + drawDist; x++) {
      for (let y = cY - drawDist; y < cY + drawDist; y++) {
        this.getChunk(x, y)
      }
    }

    this.chunks.forEach((chunk) => {
      const isVisible =
        Math.abs(cX - chunk.x) <= drawDist && Math.abs(cY - chunk.y) <= drawDist
      if (isVisible) this.loadChunk(chunk)
      else this.unloadChunk(chunk)
    })
    this.tiles = this.chunks.map((c) => c.tiles.getChildren()).flat()
  }

  getChunk = (x, y) => {
    let chunk = this.chunks.find((c) => c.x === x && c.y === y)
    if (!chunk) {
      const tiles = this.scene.add.group()
      chunk = { x, y, tiles }
      this.chunks.push(chunk)
    }
    return chunk
  }

  loadChunk = (chunk) => {
    if (chunk.isLoaded) return
    chunk.isLoaded = true

    for (let i = 0; i < chunkSize; i++) {
      for (let j = 0; j < chunkSize; j++) {
        const _x = i + chunk.x * chunkSize
        const _y = j + chunk.y * chunkSize
        const tile = this.loadTile(_x, _y)
        chunk.tiles.add(tile)
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
    const tile = this.scene.add
      .sprite(x * tileSize, y * tileSize, 'tiles', frame)
      .setOrigin(0)
      .setScale(tileSize / 32)
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

    if (sprite.mineCount === 0) {
      this.revealTileNeighbours(sprite)
    }

    this.clickedTiles[sprite._key] = { frame: sprite.frame.name }
  }

  revealTileNeighbours = (parentSprite) => {
    Object.values(parentSprite.neighbours).forEach((n) => {
      const sprite = n.getSprite()
      if (!sprite || sprite.frame.name !== 9) return
      this.revealTile(sprite)
      if (sprite.mineCount === 0) this.revealTileNeighbours(sprite)
    })
  }

  getIsMine = (x, y) =>
    integerHash(md5(`${this.seed}-${x}-${y}`)) % mineRate === 0
}

const chunkSize = 6
const tileSize = 32
const drawDist = 2
const mineRate = 18

const getChunkCoords = (n) =>
  (chunkSize * tileSize * Math.round(n / (chunkSize * tileSize))) /
  chunkSize /
  tileSize

const integerHash = (string) =>
  string.split('').reduce((n, c) => (n * 31 * c.charCodeAt(0)) % 982451653, 7)
