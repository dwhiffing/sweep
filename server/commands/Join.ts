import { Command } from '@colyseus/command'
import { Player, RoomState } from '../schema'

export class JoinCommand extends Command<RoomState, { playerId: string }> {
  validate({ playerId, name }) {
    return true
  }

  execute({ playerId, name }) {
    const player = new Player(playerId)
    player.name = name
    player.index = this.state.players.length
    this.state.players.push(player)
  }
}
