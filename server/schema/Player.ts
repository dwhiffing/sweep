import { type, Schema } from '@colyseus/schema'

export class Player extends Schema {
  reconnection: any

  @type('string')
  id = ''

  @type('string')
  name = ''

  @type('boolean')
  connected = true

  @type('number')
  score = 0

  @type('number')
  remainingConnectionTime = 0

  constructor(id: string) {
    super()
    this.id = id
  }
  addScore = (score) => {
    this.score += score
    if (this.score < 0) this.score = 0
  }
}
