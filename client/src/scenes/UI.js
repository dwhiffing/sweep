export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'UI' })
  }

  create() {
    this.cursorText = this.add
      .text(0, 0, '0,0', { color: '#000', fontFamily: 'Arial', fontSize: 12 })
      .setScrollFactor(0)
      .setOrigin(1, 1)

    this.scoreText = this.add
      .text(0, 0, '', { color: '#000', fontFamily: 'Arial', fontSize: 12 })
      .setScrollFactor(0)
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
        const player = changes.players.find((p) => p.id === playerId)
        if (player) {
          this.registry.set('score', player.score)
          this.cursor.setTint(
            Phaser.Display.Color.HexStringToColor(player.color).color,
          )
        }
      }

      sync(room.state.toJSON())
      room.onStateChange((state) => sync(state.toJSON()))
    }
  }
}
