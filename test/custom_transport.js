var test = require('tape')
var WebSocket = require('ws')
var dop = require('dop').create()
var dopServer = dop.create()
var dopClient = dop.create()

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
function reconnect(wsClientOld) {
    var keepReconnecting = true
    var wsClient = new WebSocket('ws://localhost:' + port)
    var send = function(message) {
        if (wsClient.readyState === 1) {
            wsClient.send(message)
            return true
        }
        return false
    }
    var close = () => {
        keepReconnecting = false
        wsClient.close()
    }
    wsClient.addEventListener('open', function() {
        if (wsClientOld === undefined) {
            transportClient.onOpen(wsClient, send, close)
        } else {
            transportClient.onReconnect(wsClientOld, wsClient, send, close)
        }
    })
    wsClient.addEventListener('message', function(message) {
        transportClient.onMessage(wsClient, message.data)
    })
    wsClient.addEventListener('close', function() {
        transportClient.onClose(wsClient)
        if (keepReconnecting) reconnect(wsClient)
    })
    wsClient.addEventListener('error', function(error) {
        keepReconnecting = false
        transportClient.onError(wsClient, error)
    })
    return wsClient
}

transportServer.type = 'SERVER'
transportClient.type = 'CLIENT'

var nodeServer
var nodeClient
var socketClient
var socketServer
test('CLIENT trying connect invalid port', function(t) {
    port = 2131
    var wsClient = reconnect()
    transportClient.on('error', function(socket, error) {
        t.equal(socket, wsClient)
        t.notEqual(error, undefined)
        t.end()
    })
})

test('CLIENT onConnect', function(t) {
    port = portOriginal
    reconnect()
    transportClient.on('connect', function(node) {
        nodeClient = node
        socketClient = node.socket
        t.equal(Object.keys(transportClient.nodesByToken).length, 1)
        t.equal(transportClient.nodesBySocket.size, 1)
        t.end()
    })
})

test('SERVER onConnect', function(t) {
    transportServer.on('connect', function(node) {
        nodeServer = node
        socketServer = node.socket
        t.equal(nodeServer.token, nodeClient.token)
        t.equal(Object.keys(transportServer.nodesByToken).length, 1)
        t.equal(transportServer.nodesBySocket.size, 1)
        nodeClient.socket.close()
        t.end()
    })
})

test('CLIENT onReconnect', function(t) {
    transportClient.on('reconnect', function(node) {
        t.equal(nodeClient, node)
        t.notEqual(nodeClient.socket, socketClient)
        t.equal(Object.keys(transportClient.nodesByToken).length, 1)
        t.equal(transportClient.nodesBySocket.size, 1)
        t.end()
    })
})

test('SERVER onReconnect', function(t) {
    transportServer.on('reconnect', function(node) {
        t.equal(nodeServer, node)
        t.notEqual(nodeServer.socket, socketServer)
        t.equal(Object.keys(transportServer.nodesByToken).length, 1)
        t.equal(transportServer.nodesBySocket.size, 1)
        t.end()
    })
})

test('CHEATING CONNECTION MUST CLOSE THE SOCKET', function(t) {
    var wsClient = new WebSocket('ws://localhost:' + port)
    wsClient.on('open', function() {
        wsClient.send(nodeClient.token)
    })
    wsClient.on('close', function() {
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