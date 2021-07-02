import { Command } from "@colyseus/command"
import { RoomState } from "../schema"

export class DisconnectCommand extends Command<RoomState, { playerId: string, reconnection: any }> {
  validate({ playerId, reconnection }) {
    return !!this.state.players.find(p => p.id === playerId) && reconnection
  }
  
  execute({ playerId, reconnection }) {
    const player = this.state.players.find(p => p.id === playerId)

    player.remainingConnectionTime = 120
    player.connected = false
    player.reconnection = reconnection

    player.reconnection.then(() => {
      player.connected = true
    })
  }
}