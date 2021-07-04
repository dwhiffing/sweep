import Phaser from 'phaser'
import * as scenes from './scenes'

var config = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
  backgroundColor: '#000',
  parent: 'phaser-example',
  scale: {
    // mode: Phaser.Scale.RESIZE,
    mode: Phaser.Scale.FIT,
  },
  scene: Object.values(scenes),
  pixelArt: true,
  roundPixels: true,
}

window.game = new Phaser.Game(config)
