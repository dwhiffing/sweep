import { Command } from '@colyseus/command'
import { MapSchema } from '@colyseus/schema'
import { RoomState } from '../schema'
import { getState, markTile, revealTile } from '../../lib/minesweeper'

export class MoveCommand extends Command<
  RoomState,
  { x: any; y: any; shouldMark: any }
> {
  execute({ x, y, shouldMark }) {
    if (shouldMark) {
      markTile(x, y)
    } else {
      revealTile(x, y)
    }

    this.state.tiles = new MapSchema(getState())
  }
}
