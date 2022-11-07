import Phaser from 'phaser'
import { Client } from 'colyseus.js'
import { h, render } from 'preact'
import * as scenes from './scenes'
import { App } from './app'

window.colyseus = new Client(
  process.env.NODE_ENV === 'production'
    ? 'wss://web-production-b05a.up.railway.app'
    : 'ws://localhost:3553',
)

render(
  <App
    config={{
      type: Phaser.AUTO,
      backgroundColor: '#c0c0c0',
      parent: 'sweeper',
      scale: { mode: Phaser.Scale.RESIZE },
      scene: Object.values(scenes),
      pixelArt: true,
      roundPixels: true,
    }}
  />,
  document.body,
)
