import { Minesweeper, COORDS } from '../../../lib/minesweeper'
import { COLORS } from '../scenes/UI'

export class TileService {
  constructor(scene) {
    this.scene = scene
    this.uiScene = scene.scene.get('UI')
    if (window.room) {
      this.sweeper = new Minesweeper(window.room.state.toJSON().seed)
    } else {
      this.sweeper = new Minesweeper(Date.now().toString())
    }
    this.players = []
  }

  init = () => {
    this.lastCoords = {}
    this.textGroup = this.loadText()
    this.cursorGroup = this.loadCursors()
    this.chunks = this.loadChunks()
    this.tiles = this.chunks.map((c) => c.tiles.getChildren()).flat()

    this.update(true)
  }

  sync = (state) => {
    this.sweeper.state = state.tiles
    this.players = state.players
    this.update(true)
    this.scene.registry.set(
      'scores',
      this.players.map((p) => ({
        name: p.name,
        score: p.score,
        color: COLORS[p.index],
      })),
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
              this.uiScene.cursorText.setText(`${tile._x},${tile._y}`)
              if (!this.isRevealable(tile)) return
              if (p.leftButtonDown()) {
                tile.setFrame(0)
              }
            })
            .on('pointerdown', (p) => {
              if (!this.isRevealable(tile) || p.rightButtonDown()) return
              tile.setFrame(0)
              this.scene.registry.set('face', 1)
            })
            .on('pointerout', (p) => {
              if (!this.isRevealable(tile)) return
              if (p.leftButtonDown()) {
                tile.setFrame(9)
              }
            })
            .on('pointerup', (p) => {
              if (!this.isRevealable(tile) && !p.rightButtonReleased()) return
              this.scene.registry.set('face', 0)
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
            Phaser.Display.Color.HexStringToColor(
              COLORS[matchingPlayer?.index] || '#fff',
            ).color,
          )
        } else {
          tile.clearTint()
        }
      })
    })
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

  loadCursors = () => {
    this.cursors = {}
    this.cursorTweens = {}
    const group = this.scene.add.group()
    group.createMultiple({
      key: 'cursor',
      visible: false,
      active: false,
      repeat: 9,
      max: 9,
    })
    return group
  }

  updateCursor = (playerId, index, x, y) => {
    if (!this.uiScene.player?.id) return

    this.cursorGroup.getChildren().forEach((c) => c.setVisible(false))
    let cursor = this.cursors[playerId]
    if (!cursor) {
      cursor = this.cursorGroup.get()
      cursor
        .setVisible(true)
        .setActive(true)
        .setScale(2)
        .setOrigin(0, 0)
        .setDepth(11)
      cursor.setTint(
        Phaser.Display.Color.HexStringToColor(COLORS[index] || '#fff').color,
      )
      this.cursors[playerId] = cursor
    }
    cursor.setVisible(true)
    this.cursorTweens[playerId]?.remove()
    this.cursorTweens[playerId] = this.scene.tweens.add({
      targets: cursor,
      x: x,
      y: y,
      duration: 250,
    })
  }

  onClickTile = (tile, shouldMark) => {
    const frame = this.sweeper.getTileState(tile._x, tile._y)
    if (frame !== 9) return

    const isMine = this.sweeper.getIsMine(tile._x, tile._y)
    if ((isMine && !shouldMark) || (!isMine && shouldMark))
      this.scene.cameras.main.shake(250, 0.025)

    const { _x: x, _y: y } = tile
    const value = this.sweeper.getScore(x, y, shouldMark)

    this.scene.registry.set('face', value > 0 ? 2 : 3)

    if (window.room) {
      window.room.send('Move', { x, y, shouldMark })
      return
    }

    this.showScoreText(tile.x, tile.y, value)
    this.scene.registry.set('score', (s) => Math.max(0, s + value))

    if (shouldMark) {
      this.sweeper.markTile(x, y)
    } else {
      this.sweeper.revealTile(x, y)
    }

    this.tiles.forEach((sprite) =>
      sprite.setFrame(this.sweeper.getTileState(sprite._x, sprite._y)),
    )
  }

  onMove = (index, x, y, mark) => {
    const tile = this.tiles.find((t) => t._x === x && t._y === y)
    const value = this.sweeper.getScore(x, y, mark)
    this.showScoreText(tile.x, tile.y, value, COLORS[index])
  }

  showScoreText = (x, y, value, color = '#ffffff') => {
    const text = this.textGroup.get()
    text
      .setPosition(x, y)
      .setAlpha(1)
      .setActive(true)
      .setVisible(true)
      .setDepth(10)
      .setText(`${value > 0 ? '+' : '-'}${Math.abs(value)}`)
      .setColor(color)
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
