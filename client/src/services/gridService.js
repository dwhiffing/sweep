import md5 from 'md5'

const TILE_SIZE = 32
// const CHUNK_SIZE = Math.min(Math.ceil(window.innerWidth / TILE_SIZE / 2), 35)
const CHUNK_SIZE = 20
const FLOOD_DIST = 20
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

  sync = (state) => {
    this.state = state
    this.tiles.forEach((sprite) =>
      sprite.setFrame(this.getTileState(sprite._x, sprite._y)),
    )
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
            .on('pointerover', (p) => {
              if (!this.getIsRevealable(tile._x, tile._y)) return
              if (p.leftButtonDown()) tile.setFrame(0)
            })
            .on('pointerdown', (p) => {
              if (
                !this.getIsRevealable(tile._x, tile._y) ||
                p.rightButtonDown()
              )
                return
              tile.setFrame(0)
            })
            .on('pointerout', (p) => {
              if (!this.getIsRevealable(tile._x, tile._y)) return
              if (p.leftButtonDown()) tile.setFrame(9)
            })
            .on('pointerup', (p) => {
              if (
                !this.getIsRevealable(tile._x, tile._y) &&
                !p.rightButtonReleased()
              )
                return
              this.onClickTile(tile, p.rightButtonReleased())
            })
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

      const { width, height } = this.scene.cameras.main
      const yoffset = height / 2 - (TILE_SIZE * CHUNK_SIZE) / 2
      const xoffset = width / 2 - (TILE_SIZE * CHUNK_SIZE) / 2
      chunk.tiles.getChildren().forEach((tile) => {
        tile._x = tile._cX + chunk.x * CHUNK_SIZE
        tile._y = tile._cY + chunk.y * CHUNK_SIZE
        tile.x = tile._x * TILE_SIZE + xoffset
        tile.y = tile._y * TILE_SIZE + yoffset
        tile.setFrame(this.getTileState(tile._x, tile._y))
      })
    })
  }

  onClickTile = (tile, shouldMark) => {
    if (shouldMark) {
      this.markTile(tile._x, tile._y)
    } else {
      this.revealTile(tile._x, tile._y)
    }

    this.tiles.forEach((sprite) =>
      sprite.setFrame(this.getTileState(sprite._x, sprite._y)),
    )
  }

  markTile = (x, y) => {
    const tileState = this.getTileState(x, y)
    const markFrame = tileState === 9 ? 11 : tileState === 11 ? 13 : 9
    this.setTileState(x, y, markFrame)
  }

  revealTile = (x, y) => {
    const frame = this.getIsMine(x, y) ? 10 : this.getMineCount(x, y)
    this.setTileState(x, y, frame)
    if (frame === 0) {
      // TODO: flood fill should be done on server
      this.floodFill(x, y)
    }
  }

  floodFill = (_x, _y) => {
    let stack = [[_x, _y]]

    while (stack.length) {
      let [x, y] = stack.pop()

      while (y >= _y - FLOOD_DIST && this.hasHiddenAdj(x, y)) {
        y -= 1
      }

      y += 1

      while (y <= _y + FLOOD_DIST && this.hasHiddenAdj(x, y)) {
        this.revealAdj(x, y)
        if (x > _x - FLOOD_DIST) stack.push([x - 1, y])
        if (x < _x + FLOOD_DIST) stack.push([x + 1, y])
        y += 1
      }
    }
  }

  hasHiddenAdj = (x, y) =>
    this.getFrame(x, y) === 0 &&
    NCOORDS.some(([i, j]) =>
      [9, 11, 13].includes(this.getTileState(x + i, y + j)),
    )

  revealAdj = (x, y) =>
    COORDS.forEach(([i, j]) =>
      this.setTileState(x + i, y + j, this.getFrame(x + i, y + j)),
    )

  getMineCount = (x, y) =>
    NCOORDS.reduce((n, [i, j]) => (this.getIsMine(x + i, y + j) ? n + 1 : n), 0)

  getIsRevealable = (x, y) => [9, 13].includes(this.getTileState(x, y))

  getIsMine = (x, y) => intHash(`${this.seed}-${x}-${y}`) % MINE_RATE === 0

  getTileState = (x, y) => this.state[`${x}:${y}`] ?? 9

  setTileState = (x, y, frame) => {
    this.state[`${x}:${y}`] = frame
    window.room?.send('Move', { x, y, frame })
  }

  getFrame = (x, y) => (this.getIsMine(x, y) ? 10 : this.getMineCount(x, y))
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
