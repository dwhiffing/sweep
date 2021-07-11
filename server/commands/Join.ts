import { Command } from '@colyseus/command'
import { Player, RoomState } from '../schema'

const COLORS = [
  0xffffff, 0x130fe5, 0x3ad6d3, 0x11c043, 0xfdf148, 0xff8c00, 0xdf2424,
  0xfa6c84, 0xa802bb, 0x914433,
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
