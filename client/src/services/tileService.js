import { Minesweeper, COORDS } from '../../../lib/minesweeper'

export class TileService {
  constructor(scene) {
    this.scene = scene
    this.uiScene = scene.scene.get('UI')
    this.sweeper = new Minesweeper()
    this.players = []
  }

  init = () => {
    this.lastCoords = {}
    this.chunks = this.loadChunks()
    this.tiles = this.chunks.map((c) => c.tiles.getChildren()).flat()
    this.textGroup = this.loadText()
    this.update(true)
  }

  sync = (state) => {
    this.sweeper.state = state.tiles
    this.players = state.players
    this.update(true)
  }

  loadText = () => {
    const group = this.scene.add.group({
      createCallback: (text) =>
        text
          .setFontFamily('Arial')
          .setFontSize(24)
          .setOrigin(0)
          .setStroke('#000', 4),
    })
    group.createMultiple({
      classType: Phaser.GameObjects.Text,
      key: ' ',
      visible: false,
      active: false,
      repeat: 20,
      max: 20,
    })
    return group
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
              this.uiScene.cursorText.setText(`${tile._x},${tile._y}`)
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

  update = (force) => {
    const { scrollX, scrollY } = this.scene.cameras.main
    const coords = getChunkCoords(scrollX, scrollY)
    if (
      !force &&
      this.lastCoords.x === coords.x &&
      this.lastCoords.y === coords.y
    )
      return
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
        const frame = this.sweeper.getTileState(tile._x, tile._y)
        tile.setFrame(frame)
        if (frame === 10 || frame === 11) {
          const matchingPlayer = this.players.find((p) =>
            p.tiles.find(({ x, y }) => tile._x === x && tile._y === y),
          )
          tile.setTint(
            Phaser.Display.Color.HexStringToColor(matchingPlayer?.color).color,
          )
        } else {
          tile.clearTint()
        }
      })
    })
  }

  onClickTile = (tile, shouldMark) => {
    const frame = this.sweeper.getTileState(tile._x, tile._y)
    if (frame !== 9) return

    const isMine = this.sweeper.getIsMine(tile._x, tile._y)
    if ((isMine && !shouldMark) || (!isMine && shouldMark))
      this.scene.cameras.main.shake(250, 0.025)

    const { _x: x, _y: y } = tile

    // TODO: should have server data for scoring so scores are shown on all clients
    const value = this.sweeper.getScore(x, y, shouldMark)
    this.showScoreText(tile.x, tile.y, value)

    if (window.room) {
      window.room.send('Move', { x, y, shouldMark })
      return
    }

    if (shouldMark) {
      this.sweeper.markTile(x, y)
    } else {
      this.sweeper.revealTile(x, y)
    }

    this.tiles.forEach((sprite) =>
      sprite.setFrame(this.sweeper.getTileState(sprite._x, sprite._y)),
    )
  }

  showScoreText = (x, y, value) => {
    const text = this.textGroup.get()
    text
      .setPosition(x, y)
      .setAlpha(1)
      .setActive(true)
      .setVisible(true)
      .setText(`${value > 0 ? '+' : '-'}${Math.abs(value)}`)
      .setColor(this.uiScene.player.color)
    this.scene.tweens
      .createTimeline()
      .add({ targets: text, y: y - 10, duration: 800 })
      .add({
        targets: text,
        y: y - 15,
        alpha: 0,
        duration: 400,
        onComplete: () => text.setActive(false).setVisible(false),
      })
      .play()
  }

  isRevealable = (tile) => this.sweeper.getTileState(tile._x, tile._y) === 9
}

const TILE_SIZE = 32
const CHUNK_SIZE = 18

const getChunkCoords = (x, y) => ({ x: getChunkCoord(x), y: getChunkCoord(y) })

const getChunkCoord = (n) =>
  (CHUNK_SIZE * TILE_SIZE * Math.round(n / (CHUNK_SIZE * TILE_SIZE))) /
  CHUNK_SIZE /
  TILE_SIZE
