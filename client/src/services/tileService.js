import { Minesweeper, COORDS } from '../../../lib/minesweeper'

export class TileService {
  constructor(scene) {
    this.scene = scene
    this.sweeper = new Minesweeper()
  }

  init = () => {
    this.lastCoords = {}
    this.chunks = this.loadChunks()
    this.tiles = this.chunks.map((c) => c.tiles.getChildren()).flat()
  }

  sync = (state) => {
    this.sweeper.state = state
    this.tiles.forEach((sprite) =>
      sprite.setFrame(this.sweeper.getTileState(sprite._x, sprite._y)),
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
              if (!this.isRevealable(tile)) return
              if (p.leftButtonDown()) tile.setFrame(0)
            })
            .on('pointerdown', (p) => {
              if (!this.isRevealable(tile) || p.rightButtonDown()) return
              tile.setFrame(0)
            })
            .on('pointerout', (p) => {
              if (!this.isRevealable(tile)) return
              if (p.leftButtonDown()) tile.setFrame(9)
            })
            .on('pointerup', (p) => {
              if (!this.isRevealable(tile) && !p.rightButtonReleased()) return
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
        tile.setFrame(this.sweeper.getTileState(tile._x, tile._y))
      })
    })
  }

  onClickTile = (tile, shouldMark) => {
    if (window.room) {
      window.room.send('Move', { x: tile._x, y: tile._y, shouldMark })
      return
    }

    if (shouldMark) {
      this.sweeper.markTile(tile._x, tile._y)
    } else {
      this.sweeper.revealTile(tile._x, tile._y)
    }

    this.tiles.forEach((sprite) =>
      sprite.setFrame(this.sweeper.getTileState(sprite._x, sprite._y)),
    )
  }

  isRevealable = (tile) => this.sweeper.getTileState(tile._x, tile._y) === 9
}

const TILE_SIZE = 32
const CHUNK_SIZE = 18
// const CHUNK_SIZE = Math.min(Math.ceil(window.innerWidth / TILE_SIZE / 2), 35)

const getChunkCoords = (x, y) => ({ x: getChunkCoord(x), y: getChunkCoord(y) })

const getChunkCoord = (n) =>
  (CHUNK_SIZE * TILE_SIZE * Math.round(n / (CHUNK_SIZE * TILE_SIZE))) /
  CHUNK_SIZE /
  TILE_SIZE
