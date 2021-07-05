import Phaser from 'phaser'
import * as scenes from './scenes'
import { Client } from 'colyseus.js'

window.colyseus = new Client(
  process.env.NODE_ENV === 'production'
    ? 'wss://daniel-minesweeper.herokuapp.com'
    : 'ws://localhost:3553',
)

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
