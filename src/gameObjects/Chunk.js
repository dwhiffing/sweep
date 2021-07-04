import { chunkSize, tileSize } from '../utils'
import { Tile } from './Tile'

export class Chunk {
  constructor(scene, x, y) {
    this.scene = scene
    this.x = x
    this.y = y
    this.tiles = this.scene.add.group()
  }

  load() {
    if (this.isLoaded) return
    this.isLoaded = true

    for (let i = 0; i < chunkSize; i++) {
      for (let j = 0; j < chunkSize; j++) {
        this.tiles.add(new Tile(this.scene, i, j, this.x, this.y))
      }
    }
  }

  unload() {
    if (!this.isLoaded) return
    this.isLoaded = false

    this.tiles.clear(true, true)
  }
}
