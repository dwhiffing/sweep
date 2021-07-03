import md5 from 'md5'
const chunkSize = 4
const tileSize = 32
const fullSize = chunkSize * tileSize
const drawDist = 2

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  init() {
    this.width = this.cameras.main.width
    this.height = this.cameras.main.height
  }

  create() {
    this.input.on('pointermove', this.pointerMove)
    this.input.on('pointerdown', this.pointerDown)
    this.input.on('pointerup', this.pointerUp)
    this.chunks = []
    this.clickedTiles = []
    this.cameras.main.setZoom(1.5)
    var cursors = this.input.keyboard.createCursorKeys()

    var controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      acceleration: 0.1,
      drag: 0.005,
      maxSpeed: 0.8,
    }

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
      controlConfig,
    )

    this.updateChunks()
  }

  update(time, delta) {
    this.controls.update(delta)
    this.updateChunks()
  }

  pointerMove = (pointer) => {
    if (this.draggingCamera) {
      this.cameras.main.scrollX = this._cameraX + (this._dragX - pointer.x)
      this.cameras.main.scrollY = this._cameraY + (this._dragY - pointer.y)
      this.updateChunks()
    }
  }

  pointerDown = (pointer) => {
    this.draggingCamera = true
    this._dragX = pointer.x
    this._dragY = pointer.y
    this._cameraX = this.cameras.main.scrollX
    this._cameraY = this.cameras.main.scrollY
  }

  pointerUp = () => {
    this.draggingCamera = false
  }

  getChunk(x, y) {
    let chunk = this.chunks.find((c) => c.x === x && c.y === y)
    if (!chunk) {
      chunk = new Chunk(this, x, y)
      this.chunks.push(chunk)
    }
    return chunk
  }

  updateChunks = () => {
    const { scrollX, scrollY, centerX, centerY } = this.cameras.main
    const cameraX = scrollX + centerX
    const cameraY = scrollY + centerY
    const cX =
      (fullSize * Math.round(cameraX / fullSize)) / chunkSize / tileSize
    const cY =
      (fullSize * Math.round(cameraY / fullSize)) / chunkSize / tileSize

    for (let x = cX - drawDist; x < cX + drawDist; x++) {
      for (let y = cY - drawDist; y < cY + drawDist; y++) {
        this.getChunk(x, y)
      }
    }

    this.chunks.forEach((chunk) => {
      const isVisible =
        Math.abs(cX - chunk.x) <= drawDist && Math.abs(cY - chunk.y) <= drawDist
      if (isVisible) chunk.load()
      else chunk.unload()
    })
  }
}

function integerHash(string) {
  return (string + '').split('').reduce(function (memo, item) {
    return (memo * 31 * item.charCodeAt(0)) % 982451653
  }, 7)
}

const getIsMine = (coord) => integerHash(md5(`seed-${coord}`)) % 12 === 0

class Tile extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tiles')
    this.scene = scene
    this.scene.add.existing(this)
    this.setOrigin(0).setScale(tileSize / 32)
    this.setInteractive()
    if (
      this.scene.clickedTiles.find((t) => t[0] === this.x && t[1] === this.y)
    ) {
      this.setTint(0xff0000)
    }

    this.on('pointerup', function (a, b, c) {
      this.setTint(0xff0000)
      this.scene.clickedTiles.push([this.x, this.y])
    })
  }
}

class Chunk {
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
