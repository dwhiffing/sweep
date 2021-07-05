import { Command } from '@colyseus/command'
import { RoomState } from '../schema'

export class MoveCommand extends Command<
  RoomState,
  { x: any; y: any; frame: any }
> {
  execute({ x, y, frame }) {
    this.state.tiles.set(`${x}:${y}`, frame)
  }
}
