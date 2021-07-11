import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema'
import { Player } from './Player'
import { Minesweeper } from '../../lib/minesweeper'

export class RoomState extends Schema {
  @type([Player])
  players = new ArraySchema<Player>()

  @type('string')
  seed

  @type({ map: 'number' })
  tiles = new MapSchema<number>()

  minesweeper

  constructor() {
    super()
    this.seed = Date.now().toString()
    this.minesweeper = new Minesweeper(this.seed)
  }
}
