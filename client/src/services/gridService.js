import md5 from 'md5'

const FLOOD_DIST = 20
const MINE_RATE = 8

export class GridService {
  constructor() {
    this.seed = 'seed'
    this.state = {}
    // prettier-ignore
    this.NCOORDS = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
    this.COORDS = [...this.NCOORDS, [0, 0]]
  }

  markTile = (x, y) => {
    const tileState = this.getTileState(x, y)
    const markFrame = tileState === 9 ? 11 : tileState === 11 ? 13 : 9
    this.setTileState(x, y, markFrame)
  }

  revealTile = (x, y) => {
    const frame = this.getIsMine(x, y) ? 10 : this.getMineCount(x, y)
    this.setTileState(x, y, frame)
    if (frame === 0) {
      // TODO: flood fill should be done on server
      this.floodFill(x, y)
    }
  }

  floodFill = (_x, _y) => {
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

  hasHiddenAdj = (x, y) =>
    this.getFrame(x, y) === 0 &&
    this.NCOORDS.some(([i, j]) =>
      [9, 11, 13].includes(this.getTileState(x + i, y + j)),
    )

  revealAdj = (x, y) =>
    this.COORDS.forEach(([i, j]) =>
      this.setTileState(x + i, y + j, this.getFrame(x + i, y + j)),
    )

  getMineCount = (x, y) =>
    this.NCOORDS.reduce(
      (n, [i, j]) => (this.getIsMine(x + i, y + j) ? n + 1 : n),
      0,
    )

  getIsRevealable = (x, y) => [9, 13].includes(this.getTileState(x, y))

  getIsMine = (x, y) => intHash(`${this.seed}-${x}-${y}`) % MINE_RATE === 0

  getTileState = (x, y) => this.state[`${x}:${y}`] ?? 9

  setTileState = (x, y, frame) => {
    this.state[`${x}:${y}`] = frame
    window.room?.send('Move', { x, y, frame })
  }

  getFrame = (x, y) => (this.getIsMine(x, y) ? 10 : this.getMineCount(x, y))
}

const intHash = (str) =>
  md5(str)
    .split('')
    .reduce((n, c) => (n * 31 * c.charCodeAt(0)) % 982451653, 7)
