import React from 'react'
import { Tile } from './Tile'

export function MinesweeperRoom({
  grid,
  handleClickTile,
}) {
  if (!grid) return null

  return (
    <>
      <div className="grid">
        {grid.map((tile) => {
          return (
            <Tile
              key={tile.index}
              onClick={handleClickTile}
            />
          )
        })}
      </div>
    </>
  )
}
