import React from 'react'
const width = 8
export const Tile = ({
  tile,
  onClick,
  onMouseEnter,
}) => {

  return (
    <div
      onClick={() => onClick({ tile })}
      onMouseEnter={onMouseEnter}
      style={{ flex: `0 0 ${100 / width}%` }}
    >
      <div className="no-select">
  
      </div>
    </div>
  )
}
