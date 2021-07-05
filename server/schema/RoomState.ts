import { type, Schema, ArraySchema } from '@colyseus/schema'
import { Player } from './Player'

export class RoomState extends Schema {
  @type([Player])
  players = new ArraySchema<Player>()

  constructor() {
    super()
  }
}
