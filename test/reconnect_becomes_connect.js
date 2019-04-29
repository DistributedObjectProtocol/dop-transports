const test = require('tape')
const dop = require('dop')
const dopServer = dop.create()
const dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'

const transportName = process.argv[2] || 'development'
const transportListen = require('../').listen[transportName]
const transportConnect = require('../').connect[transportName]

test('RECONNECT BECOMES A CONNECTION', function(t) {
    var server = dopServer.listen({
        transport: transportListen
    })
    var client = dopClient.connect({
        transport: transportConnect,
        listener: server
    })

    var nodeServer
    var nodeClient
    var serverConnectInc = 0
    var clientConnectInc = 0
    var maxConnections = 5

    server.on('connect', function(node) {
        t.notEqual(
            nodeServer,
            node,
            'SERVER ' + ++serverConnectInc + ' CONNECTED'
        )
        if (serverConnectInc >= maxConnections) {
            t.end()
            nodeClient.closeSocket() // avoid reconnections
            server.close() // this must terminate the server
        }
        nodeServer = node
    })
    client.on('connect', function(node) {
        t.notEqual(
            nodeServer,
            node,
            'CLIENT ' + ++clientConnectInc + ' CONNECTED'
        )
        if (clientConnectInc < maxConnections) {
            timeouts()
        }
        nodeClient = node
    })

    server.on('disconnect', function(node) {
        const nodesByToken = Object.keys(server.nodesByToken).length
        t.equal(
            node,
            nodeServer,
            'SERVER ' + ++serverConnectInc + ' disconnect'
        )
        t.equal(nodesByToken, 0, 'server nodesByToken 0')
        // t.equal(server.nodesBySocket.size, 0, 'server nodesBySocket 0')
        t.equal(nodeServer.token, nodeClient.token, 'same tokens')
        t.equal(nodeServer.status, dop.cons.NODE_STATE_DISCONNECTED)
    })
    server.on('reconnect', function(node) {
        t.equal(false, true, 'SERVER this should not happen') // this should not happen
    })
    client.on('disconnect', function(node) {
        const nodesByToken = Object.keys(client.nodesByToken).length
        t.equal(
            node,
            nodeClient,
            'CLIENT ' + ++clientConnectInc + ' disconnect'
        )
        t.equal(nodesByToken, 0, 'client nodesByToken 0')
        // t.equal(client.nodesBySocket.size, 0, 'client nodesBySocket 0')
        t.equal(nodeClient.status, dop.cons.NODE_STATE_DISCONNECTED)
    })
    client.on('reconnect', function(node) {
        t.equal(false, true, 'CLIENT this should not happen') // this should not happen
    })

    function timeouts() {
        // Disconnecting
        setTimeout(function() {
            nodeClient.socket.close()
        }, 250)
        setTimeout(function() {
            nodeServer.disconnect()
        }, 500)
    }
})
