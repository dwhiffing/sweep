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
  backgroundColor: '#c0c0c0',
  parent: 'phaser-example',
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  scene: Object.values(scenes),
  pixelArt: true,
  roundPixels: true,
}

window.game = new Phaser.Game(config)
