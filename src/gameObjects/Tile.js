import { tileSize } from '../scenes/Game'
import { getIsMine } from '../utils'

export class Tile extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles', 9)
    this.setOrigin(0)
      .setScale(tileSize / 32)
      .setInteractive()

    this.scene = scene
    this.scene.add.existing(this)
    const existingTileData = this.scene.clickedTiles[`${this.x}${this.y}`]
    if (existingTileData) {
      this.setFrame(existingTileData.frame)
    }

    this.on('pointerup', function () {
      this.setFrame(getIsMine(this.x, this.y) ? 10 : 0)
      this.scene.clickedTiles[`${this.x}${this.y}`] = {
        x: this.x,
        y: this.y,
        frame: this.frame.name,
      }
    })
  }
}
