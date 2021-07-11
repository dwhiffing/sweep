import { Command } from '@colyseus/command'
import { Player, RoomState } from '../schema'

const COLORS = [
  '#ffffff',
  '#130fe5',
  '#3ad6d3',
  '#11c043',
  '#fdf148',
  '#ff8c00',
  '#df2424',
  '#fa6c84',
  '#a802bb',
  '#914433',
]

export class JoinCommand extends Command<RoomState, { playerId: string }> {
  validate({ playerId, name }) {
    return true
  }

  execute({ playerId, name }) {
    const player = new Player(playerId)
    player.name = name
    player.color = COLORS[this.state.players.length]
    this.state.players.push(player)
  }
}
