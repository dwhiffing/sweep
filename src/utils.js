import md5 from 'md5'
export const chunkSize = 6
export const tileSize = 32
export const drawDist = 2
export const mineRate = 18

const fullSize = chunkSize * tileSize
export const getChunkCoords = (x) =>
  (fullSize * Math.round(x / fullSize)) / chunkSize / tileSize

function integerHash(string) {
  return (string + '').split('').reduce(function (memo, item) {
    return (memo * 31 * item.charCodeAt(0)) % 982451653
  }, 7)
}

export const getIsMine = (x, y) =>
  integerHash(md5(`seed-${x}-${y}`)) % mineRate === 0
