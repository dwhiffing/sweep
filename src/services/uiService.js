export class UIService {
  constructor(scene) {
    this.scene = scene
    // const { width, height } = scene.cameras.main
  }
  init() {
    this.scene.add
      .image(0, 0, 'tiles', 12)
      .setInteractive()
      .setOrigin(0)
      .on('pointerup', () => {
        if (window.room) {
          window.room?.leave()
        }
        this.scene.scene.start('Menu')
      })
  }
}
