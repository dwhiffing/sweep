import md5 from 'md5'

const FLOOD_DIST = 20
const MINE_RATE = 8
const seed = 'seed'
let state = {}
// prettier-ignore
export const NCOORDS = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
export const COORDS = [...NCOORDS, [0, 0]]

export const setState = (_state) => (state = _state)
export const getState = () => state

export const markTile = (x, y) => {
  const tileState = getTileState(x, y)
  if (![9, 11, 13].includes(tileState)) return
  const markFrame = tileState === 9 ? 11 : tileState === 11 ? 13 : 9
  setTileState(x, y, markFrame)
}

export const revealTile = (x, y) => {
  const frame = getIsMine(x, y) ? 10 : getMineCount(x, y)
  setTileState(x, y, frame)
  if (frame === 0) {
    // TODO: flood fill should be done on server
    floodFill(x, y)
  }
}

export const getTileState = (x, y) =>
  typeof state[`${x}:${y}`] === 'number' ? state[`${x}:${y}`] : 9

const floodFill = (_x, _y) => {
  let stack = [[_x, _y]]

  while (stack.length) {
    let [x, y] = stack.pop()

    while (y >= _y - FLOOD_DIST && hasHiddenAdj(x, y)) {
      y -= 1
    }

    y += 1

    while (y <= _y + FLOOD_DIST && hasHiddenAdj(x, y)) {
      revealAdj(x, y)
      if (x > _x - FLOOD_DIST) stack.push([x - 1, y])
      if (x < _x + FLOOD_DIST) stack.push([x + 1, y])
      y += 1
    }
  }
}

const hasHiddenAdj = (x, y) =>
  getFrame(x, y) === 0 &&
  NCOORDS.some(([i, j]) => [9, 11, 13].includes(getTileState(x + i, y + j)))

const revealAdj = (x, y) =>
  COORDS.forEach(([i, j]) => setTileState(x + i, y + j, getFrame(x + i, y + j)))

const getMineCount = (x, y) =>
  NCOORDS.reduce((n, [i, j]) => (getIsMine(x + i, y + j) ? n + 1 : n), 0)

const getIsMine = (x, y) => intHash(`${seed}-${x}-${y}`) % MINE_RATE === 0

const setTileState = (x, y, frame) => {
  state[`${x}:${y}`] = frame
}

const getFrame = (x, y) => (getIsMine(x, y) ? 10 : getMineCount(x, y))

const intHash = (str) =>
  md5(str)
    .split('')
    .reduce((n, c) => (n * 31 * c.charCodeAt(0)) % 982451653, 7)
