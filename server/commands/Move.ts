import { Command } from "@colyseus/command"
import { RoomState } from "../schema"

export class MoveCommand extends Command<RoomState, { from: any, to: any }> {
  validate({ from, to }) {
    return true
  }
  
  execute({ from, to }) {
  }
}