export class CameraService {
  constructor(scene) {
    this.scene = scene

    const { W, A, S, D, Q, E } = Phaser.Input.Keyboard.KeyCodes
    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
      camera: scene.cameras.main,
      left: scene.input.keyboard.addKey(A),
      right: scene.input.keyboard.addKey(D),
      up: scene.input.keyboard.addKey(W),
      down: scene.input.keyboard.addKey(S),
      acceleration: 0.1,
      drag: 0.005,
      maxSpeed: 0.3,
    })
    scene.input.keyboard.addKey(Q).on('down', () => {
      scene.cameras.main.setZoom(1)
    })
    scene.input.keyboard.addKey(E).on('down', () => {
      scene.cameras.main.setZoom(0.5)
    })
  }

  update(delta) {
    this.controls.update(delta)
  }
}
