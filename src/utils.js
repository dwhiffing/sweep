import md5 from 'md5'
import { CHUNK_SIZE, TILE_SIZE } from './constants'

export const intHash = (str) =>
  md5(str)
    .split('')
    .reduce((n, c) => (n * 31 * c.charCodeAt(0)) % 982451653, 7)

export const getChunkCoords = (x, y) => ({
  x: getChunkCoord(x),
  y: getChunkCoord(y),
})

export const isWithinDistance = (a, b, dist) =>
  Math.abs(a.x - b.x) <= dist && Math.abs(a.y - b.y) <= dist

const getChunkCoord = (n) =>
  (CHUNK_SIZE * TILE_SIZE * Math.round(n / (CHUNK_SIZE * TILE_SIZE))) /
  CHUNK_SIZE /
  TILE_SIZE
