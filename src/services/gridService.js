import { Tile } from '../gameObjects/Tile'
import { getIsMine, chunkSize, drawDist, getChunkCoords } from '../utils'

export class GridService {
  constructor(scene) {
    this.scene = scene
  }

  init() {
    this.chunks = []
    this.clickedTiles = {}
    this.update()
  }

  update() {
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

  loadChunk(chunk) {
    if (chunk.isLoaded) return
    chunk.isLoaded = true

    for (let i = 0; i < chunkSize; i++) {
      for (let j = 0; j < chunkSize; j++) {
        // const existingTileData = this.scene.clickedTiles[this._key]
        // const frame = existingTileData?.frame

        // this.neighbours = {}
        // for (var y = -1; y <= 1; y++) {
        //   for (var x = -1; x <= 1; x++) {
        //     const key = `${this._x + x}-${this._y + y}`
        //     this.neighbours[key] = {
        //       getSprite: () => this.tiles.find((t) => t._key === key),
        //       isMine: getIsMine(this._x + x, this._y + y),
        //     }
        //   }
        // }

        // this.mineCount = Object.values(this.neighbours).filter(
        //   (t) => !!t.isMine,
        // ).length
        // this.isMine = getIsMine(this._x, this._y)

        chunk.tiles.add(
          new Tile(this.scene, i, j, chunk.x, chunk.y, this.revealTile),
        )
      }
    }
  }

  unloadChunk(chunk) {
    if (!chunk.isLoaded) return
    chunk.isLoaded = false

    chunk.tiles.clear(true, true)
  }

  getChunk(x, y) {
    let chunk = this.chunks.find((c) => c.x === x && c.y === y)
    if (!chunk) {
      const tiles = this.scene.add.group()
      chunk = { x, y, tiles }
      this.chunks.push(chunk)
    }
    return chunk
  }

  revealTile = (sprite) => {
    if (sprite.frame.name !== 9) return

    sprite.setFrame(sprite.isMine ? 10 : sprite.mineCount)

    if (sprite.mineCount === 0) {
      this.revealTileNeighbours(sprite)
    }

    this.clickedTiles[sprite._key] = {
      frame: sprite.frame.name,
    }
  }

  revealTileNeighbours = (parentSprite) => {
    Object.values(parentSprite.neighbours).forEach((n) => {
      const sprite = n.getSprite()
      if (!sprite || sprite.frame.name !== 9) return
      this.revealTile(sprite)
      if (sprite.mineCount === 0) this.revealTileNeighbours(sprite)
    })
  }
}
