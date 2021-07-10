export class CameraService {
  constructor(scene) {
    this.scene = scene

    const { W, A, S, D, Q, E } = Phaser.Input.Keyboard.KeyCodes
    const camera = scene.cameras.main
    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
      camera,
      left: scene.input.keyboard.addKey(A),
      right: scene.input.keyboard.addKey(D),
      up: scene.input.keyboard.addKey(W),
      down: scene.input.keyboard.addKey(S),
      acceleration: 0.1,
      drag: 0.005,
      maxSpeed: 0.3,
    })
    scene.input.keyboard
      .addKey(Q)
      .on('down', () => camera.zoom < 2 && this.zoom(camera.zoom * 2))
    scene.input.keyboard
      .addKey(E)
      .on('down', () => camera.zoom > 0.5 && this.zoom(camera.zoom / 2))
  }

  zoom(value) {
    this.scene.cameras.main.setZoom(value)
  }

  update(delta) {
    this.controls.update(delta)
  }
}
