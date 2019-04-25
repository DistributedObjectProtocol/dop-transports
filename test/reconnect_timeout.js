const test = require('tape')
const dop = require('dop').create()
const dopServer = dop.create()
const dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'

const transportName = process.argv[2] || 'local'
const transportListen = require('../').listen[transportName]
const transportConnect = require('../').connect[transportName]

test('RECONNECTFAIL TIMEOUT', function(t) {
    var server = dopServer.listen({
        transport: transportListen
    })
    var client = dopClient.connect({
        transport: transportConnect,
        timeoutReconnect: 1,
        listener: server
    })

    var nodeServer
    var nodeClient
    var nodeServersInc = 0
    var nodeClientsInc = 0

    server.on('connect', function(node) {
        if (nodeServer === undefined) {
            t.equal(nodeServer, undefined, 'SERVER 1 CONNECTED')
        } else {
            t.notEqual(nodeServer, node, 'SERVER 2 CONNECTED')
            t.end()
            nodeClient.closeSocket() // avoid reconnections
            server.close() // this must terminate the server
        }
        nodeServer = node
    })
    client.on('connect', function(node) {
        if (nodeClient === undefined) {
            t.equal(nodeClient, undefined, 'CLIENT 1 CONNECTED')
            timeouts()
        } else {
            t.notEqual(nodeClient, node, 'CLIENT 2 CONNECTED')
        }
        nodeClient = node
    })

    server.on('disconnect', function(node) {
        const nodesByToken = Object.keys(server.nodesByToken).length
        t.equal(node, nodeServer, 'SERVER disconnect')
        t.equal(nodesByToken, 0, 'server nodesByToken 0')
        t.equal(server.nodesBySocket.size, 0, 'server nodesBySocket 0')
    })
    server.on('reconnect', function(node) {
        t.equal(false, true, 'SERVER this should not happen') // this should not happen
    })
    client.on('disconnect', function(node) {
        const nodesByToken = Object.keys(client.nodesByToken).length
        t.equal(node, nodeClient, 'CLIENT disconnect')
        t.equal(nodesByToken, 0, 'client nodesByToken 0')
        t.equal(client.nodesBySocket.size, 0, 'client nodesBySocket 0')
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
