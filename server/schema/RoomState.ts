import { type, Schema, ArraySchema } from '@colyseus/schema'
import { Player } from './Player'

export class Tile extends Schema {
  @type("number")
  index: number;

  @type("string")
  value: string;

  constructor({ index, value }) {
    super()
    this.index = index
    this.value = value
  }
}

export class RoomState extends Schema {

  @type([Player])
  players = new ArraySchema<Player>();

  constructor() {
    super()
  }
}
