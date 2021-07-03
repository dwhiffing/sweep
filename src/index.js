import Phaser from 'phaser'
import * as scenes from './scenes'

var config = {
  type: Phaser.AUTO,
  width: 320,
  height: 320,
  backgroundColor: '#1d332f',
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
