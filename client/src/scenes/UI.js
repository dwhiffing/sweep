export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'UI' })
  }

  create() {
    this.add
      .image(0, 0, 'tiles', 12)
      .setInteractive()
      .setOrigin(0)
      .setScrollFactor(0)
      .on('pointerup', this.onLeave)
  }

  onLeave = () => {
    const game = this.scene.get('Game')
    if (window.room) {
      window.room?.leave()
    }
    this.scene.get('Game').scene.stop()
    this.scene.stop().run('Menu')
  }
}
