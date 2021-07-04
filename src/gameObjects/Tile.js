import { getIsMine, chunkSize, tileSize } from '../utils'

export class Tile extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, offsetX, offsetY, onReveal) {
    const chunkOffsetX = offsetX * (chunkSize * tileSize)
    const chunkOffsetY = offsetY * (chunkSize * tileSize)
    const _x = chunkOffsetX + x * tileSize
    const _y = chunkOffsetY + y * tileSize
    super(scene, _x, _y, 'tiles', 9)
    this._x = x + offsetX * chunkSize
    this._y = y + offsetY * chunkSize
    this._key = `${this._x}-${this._y}`
    this.setOrigin(0)
      .setScale(tileSize / 32)
      .setInteractive()

    this.scene = scene
    this.scene.add.existing(this)

    const existingTileData = this.scene.gridService.clickedTiles[this._key]
    if (existingTileData) {
      this.setFrame(existingTileData.frame)
    }

    this.neighbours = {}
    for (var y = -1; y <= 1; y++) {
      for (var x = -1; x <= 1; x++) {
        const key = `${this._x + x}-${this._y + y}`
        this.neighbours[key] = {
          getSprite: () =>
            this.scene.gridService.tiles.find((t) => t._key === key),
          isMine: getIsMine(this._x + x, this._y + y),
        }
      }
    }
    this.mineCount = Object.values(this.neighbours).filter(
      (t) => !!t.isMine,
    ).length
    this.isMine = getIsMine(this._x, this._y)

    this.on('pointerup', () => onReveal(this))
  }
}
