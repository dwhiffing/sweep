import { Room, Client, ServerError } from 'colyseus'
import { RoomState } from '../schema'
import { Dispatcher } from '@colyseus/command'
import * as Commands from '../commands'

export class MinesweeperRoom extends Room<RoomState> {
  maxClients = 10
  dispatcher = new Dispatcher(this)

  onCreate({ roomName = 'MinesweeperRoom' } = {}) {
    this.setState(new RoomState())
    this.setMetadata({ roomName })

    this.onMessage('*', (client, action, _data = {}) => {
      const Command = Commands[action + 'Command']
      if (Command) {
        this.dispatcher.dispatch(new Command(), {
          ..._data,
          broadcast: this.broadcast.bind(this),
          playerId: _data.playerId || client.sessionId,
        })
      }

      const player = this.state.players.find((p) => p.id === client.sessionId)

      if (action === 'Move') {
        this.broadcast(
          'Move',
          `${player.index}:${_data.x}:${_data.y}:${_data.shouldMark}`,
        )
      } else if (action === 'Cursor') {
        this.broadcast(
          'Cursor',
          `${player.id}:${player.index}:${_data.x}:${_data.y}`,
          { except: client },
        )
      }
    })
  }

  onAuth() {
    if (this.state.players.length >= 10)
      throw new ServerError(400, 'Too many players')

    return true
  }

  onJoin(client: Client, options) {
    const playerId = client.sessionId
    this.dispatcher.dispatch(new Commands.JoinCommand(), {
      playerId,
      ...options,
    })
    this.broadcast('message', options.name + ' joined')
  }

  onLeave = async (client, consented) => {
    const playerId = client.sessionId
    if (consented) {
      this.dispatcher.dispatch(new Commands.LeaveCommand(), { playerId })
    } else {
      const reconnection = this.allowReconnection(client)
      this.dispatcher.dispatch(new Commands.DisconnectCommand(), {
        playerId,
        reconnection,
      })
    }
  }
}
