export class CameraService {
  constructor(scene) {
    this.scene = scene
    this.scene.cameras.main.setZoom(1)

    const { W, A, S, D, Q, E } = Phaser.Input.Keyboard.KeyCodes
    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
      camera: scene.cameras.main,
      left: scene.input.keyboard.addKey(A),
      right: scene.input.keyboard.addKey(D),
      up: scene.input.keyboard.addKey(W),
      down: scene.input.keyboard.addKey(S),
      zoomIn: scene.input.keyboard.addKey(Q),
      zoomOut: scene.input.keyboard.addKey(E),
      acceleration: 0.1,
      drag: 0.005,
      maxSpeed: 0.3,
    })
  }

  update(delta) {
    this.controls.update(delta)
  }
}
