const test = require('tape')
const dop = require('dop').create()

const transportName = process.argv[2] || 'development'
const transportListen = require('../').listen[transportName]
const transportConnect = require('../').connect[transportName]

test('SERVER DISCONNECT()', function(t) {
    logic(t, true)
})

test('CLIENT DISCONNECT()', function(t) {
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
        t.test(nodeServer, undefined)
        nodeServer = node
    })
    client.on('connect', function(node) {
        t.test(nodeClient, undefined)
        nodeClient = node
        if (isServer) {
            node.disconnect()
        } else {
            nodeClient.disconnect()
        }
    })

    server.on('disconnect', function(node) {
        const nodesByToken = Object.keys(server.nodesByToken).length
        t.equal(nodeServer.status, dop.cons.NODE_STATE_DISCONNECTED)
        t.equal(node, nodeServer, 'SERVER disconnect')
        t.equal(nodesByToken, 0, 'server nodesByToken 0')
        // t.equal(server.nodesBySocket.size, 0, 'server nodesBySocket 0')
        if (!isServer) {
            server.close()
            t.end()
        }
    })
    server.on('reconnect', function() {
        t.equal(false, true, 'SERVER this should not happen') // this should not happen
    })

    client.on('disconnect', function(node) {
        const nodesByToken = Object.keys(client.nodesByToken).length
        t.equal(nodeClient.status, dop.cons.NODE_STATE_DISCONNECTED)
        t.equal(node, nodeClient, 'CLIENT disconnect')
        t.equal(nodesByToken, 0, 'client nodesByToken 0')
        // t.equal(client.nodesBySocket.size, 0, 'client nodesBySocket 0')
        if (isServer) {
            server.close()
            t.end()
        }
    })
    client.on('reconnect', function() {
        t.equal(false, true, 'CLIENT this should not happen') // this should not happen
    })
}
