var test = require('tape')
var dop = require('dop')
var dopServer = dop.create()
var dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'

var transportName = process.argv[2] || 'development'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('RECONNECT AFTER SERVER CLOSE', function(t) {
    var server = dopServer.listen({ transport: transportListen })
    var client = dopClient.connect({
        transport: transportConnect,
        listener: server
    })

    var nodeServer,
        nodeClient,
        socketServer,
        socketClient,
        tokenServer,
        tokenClient

    server.on('connect', function(node) {
        // Disconnecting
        setTimeout(function() {
            server.close()
        }, 500)
        t.equal(nodeServer, undefined, 'SERVER connect')
        nodeServer = node
        socketServer = node.socket
        tokenServer = node.token
    })
    client.on('connect', function(node) {
        t.equal(nodeClient, undefined, 'CLIENT connect')
        nodeClient = node
        socketClient = node.socket
        tokenClient = node.token
        nodeClient.on('error', function() {
            t.equal(
                nodeClient.status,
                dop.cons.NODE_STATE_RECONNECTING,
                'CLIENT onerror'
            )
        })
    })

    client.on('error', function(node) {
        t.equal(
            nodeClient.status,
            dop.cons.NODE_STATE_RECONNECTING,
            'CLIENT onerror'
        )
        server = dopServer.listen({ transport: transportListen })
    })

    server.on('disconnect', function(node) {
        const nodesByToken = Object.keys(server.nodesByToken).length
        t.equal(node, nodeServer, 'SERVER disconnect')
        t.equal(nodesByToken, 0, 'server nodesByToken 0')
    })

    client.on('disconnect', function(node) {
        const nodesByToken = Object.keys(client.nodesByToken).length
        t.equal(nodeClient.status, dop.cons.NODE_STATE_DISCONNECTED)
        t.equal(nodesByToken, 0, 'server nodesByToken 0')
    })
})
