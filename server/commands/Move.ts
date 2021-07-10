import { Command } from '@colyseus/command'
import { MapSchema } from '@colyseus/schema'
import { RoomState } from '../schema'
import {
  getIsMine,
  getState,
  markTile,
  revealTile,
} from '../../lib/minesweeper'

export class MoveCommand extends Command<
  RoomState,
  { playerId; x: any; y: any; shouldMark: any }
> {
  execute({ playerId, x, y, shouldMark }) {
    const player = this.state.players.find((p) => p.id === playerId)
    const isMine = getIsMine(x, y)
    if (shouldMark && isMine) {
      markTile(x, y)
      player.addScore(1)
    } else {
      player.addScore(shouldMark ? -1 : isMine ? -10 : 1)
      revealTile(x, y)
    }

    this.state.tiles = new MapSchema(getState())
  }
}
