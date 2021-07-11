import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema'
import { Player } from './Player'
import { Minesweeper } from '../../lib/minesweeper'

export class RoomState extends Schema {
  @type([Player])
  players = new ArraySchema<Player>()

  @type({ map: 'number' })
  tiles = new MapSchema<number>()

  minesweeper

  constructor() {
    super()
    this.minesweeper = new Minesweeper(Date.now().toString())
  }
}
