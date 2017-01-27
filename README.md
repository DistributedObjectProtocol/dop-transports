# JavaScript transports for dop

[https://distributedobjectprotocol.org/transports](https://distributedobjectprotocol.org/transports)








<!--

# node.js can
### Listen via:
| Protocol  | name | port default |
| ----------- |:-------:| -------:|
| WebSockets ✓ | [ws](https://github.com/websockets/ws) | 4444  |
| WebSockets    | [uws](https://github.com/uWebSockets/uWebSockets)  | 4444  |
| [socket.io](https://github.com/socketio/socket.io)    | socketio  | 4445  |
| [SockJS](https://github.com/sockjs/sockjs-node)    | sockjs  | 4446  |


### Connect via:
| Protocol  | name | url default |
| ----------- |:-------:| -------:|
| WebSockets ✓ | [ws](https://github.com/websockets/ws) | `http://localhost:4444`  |
| [socket.io](https://github.com/socketio/socket.io)    | socketio  | `http://localhost:4445`  |
| [SockJS](https://github.com/sockjs/sockjs-node)    | sockjs  | `http://localhost:4446`  |


# Browser can
### Connect via:
| Protocol  | name | url default |
| ----------- |:-------:| -------:|
| WebSockets ✓ | websocket | `http://localhost:4444`  |
| [socket.io](https://github.com/socketio/socket.io)    | socketio  | `http://localhost:4445`  |
| [SockJS](https://github.com/sockjs/sockjs-node)    | sockjs  | `http://localhost:4446`  |



✓ Means is default if not transport is passed as option




# By technology

### WebSockets ([ws](https://github.com/websockets/ws))
|    | Browser | node.js |
| ----------- |:-------:| -------:|
| __Browser__     | ❌ | ✅  |
| __node.js__     | ✅  | ✅  |

### [socket.io](https://github.com/socketio)
|   | Browser | node.js |
| ----------- |:-------:| -------:|
| __Browser__     | ❌ | ✅  |
| __node.js__     | ✅  | ✅  |

### [SockJS](https://github.com/sockjs)
|   | Browser | node.js |
| ----------- |:-------:| -------:|
| __Browser__     | ❌ | ✅  |
| __node.js__     | ✅  | ✅  |




# All

|             | Browser | node.js |
| ----------- |:-------:| -------:|
| __Browser__     | - | WebSockets, [socket.io](https://github.com/socketio), [SockJS](https://github.com/sockjs)  |
| __node.js__     | WebSockets, [socket.io](https://github.com/socketio), [SockJS](https://github.com/sockjs)  | WebSockets, [socket.io](https://github.com/socketio), [SockJS](https://github.com/sockjs)  |





# By Platform

| Browser | Listen | Connect |
| ---------- |:--:| --:|
| WebSockets    | ❌ |✅ |
| [socket.io](https://github.com/socketio)  | ❌ |✅ |
| [SockJS](https://github.com/sockjs)     | ❌ |✅ |

| node.js | Listen | Connect |
| --------------- |:--:| --:|
| WebSockets ([ws](https://github.com/websockets/ws)) | ✅ | ✅ |
| [socket.io](https://github.com/socketio)       | ✅ | ✅ |
| [SockJS](https://github.com/sockjs)          | ✅ | ✅ |
-->


