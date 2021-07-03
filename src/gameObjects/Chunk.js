import { chunkSize, fullSize, tileSize } from '../scenes/Game'
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
        const x = this.x * fullSize + i * tileSize
        const y = this.y * fullSize + j * tileSize
        this.tiles.add(new Tile(this.scene, x, y))
      }
    }
  }
  unload() {
    if (!this.isLoaded) return
    this.tiles.clear(true, true)
    this.isLoaded = false
  }
}
