var test = require('tape')
var WebSocket = require('ws')
var dop = require('dop')
var dopServer = dop.create()
var dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'

var portOriginal = 8989
var port = portOriginal
var transportServer = dopServer.createTransport()
var transportClient = dopClient.createTransport()

// SERVER
var wsServer = new WebSocket.Server({ port })
var send = function(message) {
    if (this.readyState === 1) {
        this.send(message)
        return true
    }
    return false
}
wsServer.on('connection', function(socket) {
    transportServer.onOpen(socket, send.bind(socket), socket.close.bind(socket))
    socket.on('message', function(message) {
        transportServer.onMessage(socket, message)
    })
    socket.on('close', function() {
        transportServer.onClose(socket)
    })
    socket.on('error', function(error) {
        transportServer.onError(socket, error)
    })
})

// CLIENT
function reconnect(socket_closed) {
    var keepReconnecting = true
    var socket = new WebSocket('ws://localhost:' + port)
    var socket_open = socket_closed
    var send = function(message) {
        if (socket.readyState === 1) {
            socket.send(message)
            return true
        }
        return false
    }
    var close = () => {
        keepReconnecting = false
        socket.close()
    }
    socket.addEventListener('open', function() {
        socket_open = socket
        if (socket_closed === undefined) {
            transportClient.onOpen(socket, send, close)
        } else {
            transportClient.onReconnect(socket_closed, socket, send, close)
        }
    })
    socket.addEventListener('message', function(message) {
        transportClient.onMessage(socket, message.data)
    })
    socket.addEventListener('close', function() {
        transportClient.onClose(socket)
        if (keepReconnecting) reconnect(socket_open)
    })
    socket.addEventListener('error', function(error) {
        keepReconnecting = false
        transportClient.onError(socket, error)
    })
    return socket
}

transportServer.type = 'SERVER'
transportClient.type = 'CLIENT'

var nodeServer
var nodeClient
var socketClient
var socketServer
test('CLIENT trying connect invalid port', function(t) {
    port = 2131
    var socket = reconnect()
    transportClient.on('error', function(socket, error) {
        t.equal(socket, socket)
        t.notEqual(error, undefined)
        t.end()
    })
})

test('onConnect', function(t) {
    port = portOriginal
    reconnect()
    transportServer.on('connect', function(node) {
        nodeServer = node
        socketServer = node.socket
        t.equal(Object.keys(transportServer.nodesByToken).length, 1)
        // t.equal(transportServer.nodesBySocket.size, 1)
    })
    transportClient.on('connect', function(node) {
        nodeClient = node
        socketClient = node.socket
        t.equal(nodeServer.token, nodeClient.token)
        t.equal(Object.keys(transportClient.nodesByToken).length, 1)
        // t.equal(transportClient.nodesBySocket.size, 1)
        nodeClient.socket.close()
        t.end()
    })
})

test('SERVER onReconnect', function(t) {
    transportServer.on('reconnect', function(node) {
        t.equal(nodeServer, node)
        t.notEqual(nodeServer.socket, socketServer)
        t.equal(Object.keys(transportServer.nodesByToken).length, 1)
        // t.equal(transportServer.nodesBySocket.size, 1)
        t.end()
    })
})

test('CLIENT onReconnect', function(t) {
    transportClient.on('reconnect', function(node) {
        t.equal(nodeClient, node)
        t.notEqual(nodeClient.socket, socketClient)
        t.equal(Object.keys(transportClient.nodesByToken).length, 1)
        // t.equal(transportClient.nodesBySocket.size, 1)
        t.end()
    })
})

test('CHEATING CONNECTION MUST CLOSE THE SOCKET', function(t) {
    var socket = new WebSocket('ws://localhost:' + port)
    socket.on('open', function() {
        socket.send(nodeClient.token)
    })
    socket.on('close', function() {
        t.equal(true, true)
        t.end()
    })
})

test('SERVER RUN disconnect()', function(t) {
    transportServer.on('disconnect', function(node) {
        t.equal(nodeServer, node)
    })
    transportClient.on('disconnect', function(node) {
        t.equal(nodeClient, node)
        wsServer.close()
        t.end()
    })
    nodeServer.disconnect()
})
