import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema'
import { Player } from './Player'

export class RoomState extends Schema {
  @type([Player])
  players = new ArraySchema<Player>()

  @type({ map: 'number' })
  tiles = new MapSchema<number>()

  constructor() {
    super()
  }
}
