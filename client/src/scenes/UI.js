export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'UI' })
  }

  create() {
    this.cursorText = this.add
      .text(0, 0, '0,0')
      .setFontSize(12)
      .setColor('#000')
      .setFontFamily('Arial')
      .setOrigin(1, 1)

    this.cursor = this.add
      .sprite(0, 0, 'cursor')
      .setScale(2)
      .setScrollFactor(0)
      .setOrigin(0, 0)

    this.input.on('pointermove', (p) => {
      this.cursor.setPosition(p.x, p.y)
      this.cursorText.setPosition(p.x, p.y)
    })

    if (window.room) {
      const room = window.room
      const sync = (changes) => {
        const playerId = localStorage.getItem(room.id)
        this.player = changes.players.find((p) => p.id === playerId)
        if (this.player) {
          this.registry.set('score', this.player.score)
          this.cursor.setTint(
            Phaser.Display.Color.HexStringToColor(
              COLORS[this.player?.index] || '#fff',
            ).color,
          )
        }
      }

      sync(room.state.toJSON())
      room.onStateChange((state) => sync(state.toJSON()))
    }
  }
}

export const COLORS = [
  '#ffffff',
  '#4a46fb',
  '#3ad6d3',
  '#11c043',
  '#fdf148',
  '#ff8c00',
  '#df2424',
  '#fa6c84',
  '#a802bb',
  '#914433',
]
