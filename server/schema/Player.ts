import { type, ArraySchema, Schema } from '@colyseus/schema'

class Coord extends Schema {
  @type('number') x: number
  @type('number') y: number
}
export class Player extends Schema {
  reconnection: any

  @type('string')
  id = ''

  @type('string')
  name = ''

  @type('boolean')
  connected = true

  @type([Coord])
  tiles = new ArraySchema<Coord>()

  @type(Coord)
  cursor = new Coord({ x: 0, y: 0 })

  @type('number')
  score = 0

  @type('string')
  color = '#ff0000'

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

  addTile = (x, y) => {
    this.tiles.push(new Coord({ x, y }))
  }

  moveCursor = (x, y) => {
    this.cursor = new Coord({ x, y })
  }
}
