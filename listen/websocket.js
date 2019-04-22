// https://github.com/websockets/ws
function ws(dop, options) {
    // Defaults
    if (typeof options.port != 'number' && options.server === undefined) {
        options.port = 4444
    }
    if (options.httpServer !== undefined && options.server === undefined) {
        options.server = options.httpServer
    }
    if (typeof options.timeout != 'number') {
        options.timeout = 60 // seconds
    }
    if (typeof options.namespace != 'string') {
        options.namespace = '/' + dop.name
    }

    options.perMessageDeflate = false // https://github.com/websockets/ws/issues/923

    var transport = dop.createTransport()
    var WebSocketServer = options.transport.getApi()
    var ws_server = new WebSocketServer(options)
    var send = function(message) {
        if (this.readyState === 1) {
            this.send(message)
            return true
        }
        return false
    }
    transport.socket = ws_server
    ws_server.on('connection', function(socket) {
        transport.onOpen(socket, send.bind(socket), socket.close.bind(socket))
        socket.on('message', function(message) {
            transport.onMessage(socket, message)
        })
        socket.on('close', function() {
            transport.onClose(socket)
            setTimeout(function() {
                transport.onDisconnect(socket)
            }, options.timeout * 1000)
        })
        socket.on('error', function(error) {
            transport.onError(socket, error)
        })
    })

    return transport
}

ws.getApi = function() {
    return require('ws').Server
}
module.exports = ws
