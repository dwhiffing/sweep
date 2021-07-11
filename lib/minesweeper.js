import md5 from 'md5'

const FLOOD_DIST = 20
const MINE_RATE = 8

export class Minesweeper {
  constructor() {
    // TODO: randomize seed
    this.seed = 'seed'
    this.state = {}

    this.markTile = (x, y) => {
      const tileState = this.getTileState(x, y)
      if (![9, 11].includes(tileState)) return
      const markFrame = tileState === 9 ? 11 : 9
      this.setTileState(x, y, markFrame)
    }

    this.revealTile = (x, y) => {
      const frame = this.getIsMine(x, y) ? 10 : this.getMineCount(x, y)
      this.setTileState(x, y, frame)
      if (frame === 0) this.floodFill(x, y)
    }

    this.getIsMine = (x, y) =>
      intHash(`${this.seed}-${x}-${y}`) % MINE_RATE === 0

    this.getTileState = (x, y) =>
      typeof this.state[`${x}:${y}`] === 'number' ? this.state[`${x}:${y}`] : 9

    // TODO: doesn't fill diagonally
    this.floodFill = (_x, _y) => {
      let stack = [[_x, _y]]

      while (stack.length) {
        let [x, y] = stack.pop()

        while (y >= _y - FLOOD_DIST && this.hasHiddenAdj(x, y)) {
          y -= 1
        }

        y += 1

        while (y <= _y + FLOOD_DIST && this.hasHiddenAdj(x, y)) {
          this.revealAdj(x, y)
          if (x > _x - FLOOD_DIST) stack.push([x - 1, y])
          if (x < _x + FLOOD_DIST) stack.push([x + 1, y])
          y += 1
        }
      }
    }

    this.getScore = (x, y, shouldMark) => {
      const isMine = this.getIsMine(x, y)
      const mineCount = this.getMineCount(x, y)
      if (shouldMark) {
        return isMine ? 1 : -1
      } else {
        return isMine ? -10 : mineCount === 0 ? 3 : 1
      }
    }

    this.hasHiddenAdj = (x, y) =>
      this.getFrame(x, y) === 0 &&
      NCOORDS.some(([i, j]) =>
        [9, 11].includes(this.getTileState(x + i, y + j)),
      )

    this.revealAdj = (x, y) =>
      COORDS.forEach(([i, j]) =>
        this.setTileState(x + i, y + j, this.getFrame(x + i, y + j)),
      )

    this.getMineCount = (x, y) =>
      NCOORDS.reduce(
        (n, [i, j]) => (this.getIsMine(x + i, y + j) ? n + 1 : n),
        0,
      )

    this.setTileState = (x, y, frame) => {
      this.state[`${x}:${y}`] = frame
    }

    this.getFrame = (x, y) =>
      this.getIsMine(x, y) ? 10 : this.getMineCount(x, y)
  }
}

const intHash = (str) =>
  md5(str)
    .split('')
    .reduce((n, c) => (n * 31 * c.charCodeAt(0)) % 982451653, 7)

// prettier-ignore
export const NCOORDS = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
export const COORDS = [...NCOORDS, [0, 0]]
