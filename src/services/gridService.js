import md5 from 'md5'

const CHUNK_SIZE = 20
const TILE_SIZE = 32
const MINE_RATE = 8

export class GridService {
  constructor(scene) {
    this.scene = scene
  }

  init = () => {
    this.seed = 'seed'
    this.state = {}
    this.lastCoords = {}
    this.chunks = this.loadChunks()
    this.tiles = this.chunks.map((c) => c.tiles.getChildren()).flat()
  }

  loadChunks = () =>
    COORDS.map(([x, y]) => {
      const tiles = this.scene.add.group()
      for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
          const tile = this.scene.add.sprite(0, 0, 'tiles').setOrigin(0)
          tiles.add(tile)
          tile._cX = x
          tile._cY = y
          tile
            .setInteractive()
            .on('pointerup', (p) =>
              this.onClickTile(tile, p.rightButtonReleased()),
            )
        }
      }
      return { x, y, tiles }
    })

  update = () => {
    const { scrollX, scrollY } = this.scene.cameras.main
    const coords = getChunkCoords(scrollX, scrollY)
    if (this.lastCoords.x === coords.x && this.lastCoords.y === coords.y) return
    this.lastCoords = coords

    this.chunks.forEach((chunk, i) => {
      chunk.x = COORDS[i][0] + coords.x
      chunk.y = COORDS[i][1] + coords.y

      const { width } = this.scene.cameras.main
      const offset = width / 2 - (TILE_SIZE * CHUNK_SIZE) / 2
      chunk.tiles.getChildren().forEach((tile) => {
        tile._x = tile._cX + chunk.x * CHUNK_SIZE
        tile._y = tile._cY + chunk.y * CHUNK_SIZE
        tile.x = tile._x * TILE_SIZE + offset
        tile.y = tile._y * TILE_SIZE + offset
        tile.setFrame(this.getTile(tile._x, tile._y))
      })
    })
  }

  onClickTile = (tile, shouldMark) => {
    this.revealCount = 0

    if (shouldMark) {
      this.markTile(tile._x, tile._y)
    } else {
      this.revealTile(tile._x, tile._y)
    }

    this.tiles.forEach((sprite) =>
      sprite.setFrame(this.getTile(sprite._x, sprite._y)),
    )
  }

  markTile = (x, y) => {
    const tileState = this.getTile(x, y)
    if (tileState === 10) return

    const markFrame = tileState === 9 ? 11 : tileState === 11 ? 13 : 9
    this.setTileState(x, y, markFrame)
  }

  revealTile = (x, y) => {
    if (![9, 13].includes(this.getTile(x, y))) return

    const frame = this.getIsMine(x, y) ? 10 : this.getMineCount(x, y)
    this.setTileState(x, y, frame)

    if (frame === 0 && this.revealCount++ < 10000)
      NCOORDS.forEach(([i, j]) => this.revealTile(x + i, y + j))
  }

  getMineCount = (x, y) =>
    NCOORDS.reduce((n, [i, j]) => (this.getIsMine(x + i, y + j) ? n + 1 : n), 0)

  getIsMine = (x, y) => intHash(`${this.seed}-${x}-${y}`) % MINE_RATE === 0

  getTile = (x, y) => this.state[`${x}:${y}`]?.frame ?? 9

  setTileState = (x, y, frame) => (this.state[`${x}:${y}`] = { frame })
}

const intHash = (str) =>
  md5(str)
    .split('')
    .reduce((n, c) => (n * 31 * c.charCodeAt(0)) % 982451653, 7)

const getChunkCoords = (x, y) => ({ x: getChunkCoord(x), y: getChunkCoord(y) })

const getChunkCoord = (n) =>
  (CHUNK_SIZE * TILE_SIZE * Math.round(n / (CHUNK_SIZE * TILE_SIZE))) /
  CHUNK_SIZE /
  TILE_SIZE

// prettier-ignore
const NCOORDS = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
const COORDS = [...NCOORDS, [0, 0]]
