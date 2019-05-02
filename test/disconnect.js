const test = require('tape')
const dop = require('dop').create()

const transportName = process.argv[2] || 'development'
const transportListen = require('../').listen[transportName]
const transportConnect = require('../').connect[transportName]

test('SERVER disconnect()', function(t) {
    logic(t, true)
})

test('CLIENT disconnect()', function(t) {
    logic(t, false)
})

function logic(t, isServer) {
    const dopServer = dop.create()
    const dopClient = dop.create()
    dopServer.env = 'SERVER'
    dopClient.env = 'CLIENT'

    var server = dopServer.listen({
        transport: transportListen
    })
    var client = dopClient.connect({
        transport: transportConnect
    })

    var nodeServer
    var nodeClient
    server.on('connect', function(node) {
        t.equal(nodeServer, undefined, 'SERVER connect')
        nodeServer = node
    })
    client.on('connect', function(node) {
        t.equal(nodeClient, undefined, 'CLIENT connect')
        nodeClient = node
        if (isServer) {
            nodeServer.disconnect()
        } else {
            nodeClient.disconnect()
        }
    })

    server.on('disconnect', function(node) {
        t.equal(node, nodeServer, 'SERVER disconnect')
        t.equal(node.status, dop.cons.NODE_STATUS_DISCONNECTED)
        if (!isServer) {
            server.socket.close()
            t.end()
        }
    })

    client.on('disconnect', function(node) {
        t.equal(node, nodeClient, 'CLIENT disconnect')
        t.equal(node.status, dop.cons.NODE_STATUS_DISCONNECTED)
        if (isServer) {
            server.socket.close()
            t.end()
        }
    })

    server.on('reconnect', function() {
        t.equal(false, true, 'SERVER this should not happen') // this should not happen
    })
    client.on('reconnect', function() {
        t.equal(false, true, 'CLIENT this should not happen') // this should not happen
    })
}
