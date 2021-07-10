import { Command } from '@colyseus/command'
import { MapSchema } from '@colyseus/schema'
import { RoomState } from '../schema'

export class MoveCommand extends Command<
  RoomState,
  { playerId; x: any; y: any; shouldMark: any }
> {
  execute({ playerId, x, y, shouldMark }) {
    const player = this.state.players.find((p) => p.id === playerId)
    const frame = this.state.minesweeper.getTileState(x, y)
    const isMine = this.state.minesweeper.getIsMine(x, y)
    if (frame !== 9) return
    if (shouldMark && isMine) {
      this.state.minesweeper.markTile(x, y)
      player.addScore(1)
    } else {
      player.addScore(shouldMark ? -1 : isMine ? -10 : 1)
      this.state.minesweeper.revealTile(x, y)
    }

    this.state.tiles = new MapSchema(this.state.minesweeper.state)
  }
}
