import { Command } from "@colyseus/command"
import { RoomState } from "../schema"

export class LeaveCommand extends Command<RoomState, { playerId: string }> {
  execute({ playerId }) {
    this.state.players = this.state.players.filter(p => p.id !== playerId)
  }
}