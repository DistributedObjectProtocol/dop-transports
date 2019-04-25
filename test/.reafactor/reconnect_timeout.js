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

    server.on('connect', function(node) {
        nodeServer = node
    })
    client.on('connect', function(node) {
        nodeClient = node
        timeouts()
    })

    // server.on('disconnect', function(node) {
    //     const nodesByToken = Object.keys(server.nodesByToken).length
    //     t.equal(node, nodeServer, 'SERVER disconnect')
    //     t.equal(nodesByToken, 0, 'server nodesByToken 0')
    //     t.equal(server.nodesBySocket.size, 0, 'server nodesBySocket 0')
    // })
    // server.on('reconnect', function(node, oldSocket) {
    //     t.equal(false, true, 'SERVER this should not happen') // this should not happen
    // })

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
