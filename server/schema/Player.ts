import { type, Schema } from '@colyseus/schema'

export class Player extends Schema {
  reconnection: any

  @type('string')
  id = ''

  @type('string')
  name = ''

  @type('number')
  team = -1

  @type('boolean')
  connected = true

  @type('number')
  remainingConnectionTime = 0

  constructor(id: string) {
    super()
    this.id = id
  }
}

