import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { OnlineRoom } from './screens/OnlineRoom'
import { Lobby } from './screens/Lobby'
import { Client } from 'colyseus.js'
// import './index.css'
import md5 from 'md5'

function integerHash(string) {
  return (string + '').split('').reduce(function (memo, item) {
    return (memo * 31 * item.charCodeAt(0)) % 982451653
  }, 7)
}

// window.colyseus = new Client(
//   process.env.NODE_ENV === 'production'
//     ? 'wss://daniel-minesweeper.herokuapp.com'
//     : 'ws://localhost:3553',
// )

// function App() {
//   const [room, setRoom] = useState()
//   const state = { room, setRoom,  }

//   return room ? (
//     <OnlineRoom {...state} />
//   ) : (
//     <Lobby {...state} />
//   )
// }

// ReactDOM.render(<App />, document.getElementById('root'))

const getIsMine = (coord) => integerHash(md5(`seed-${coord}`)) % 12 === 0

for (let i = 0; i < 100; i++) {
  console.log(getIsMine(i))
}
