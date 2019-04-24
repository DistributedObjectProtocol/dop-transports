var test = require('tape')
var dop = require('dop').create()
var dopServer = dop.create()
var dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'

var transportName = process.argv[2] || 'local'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('RECONNECT TEST', function(t) {
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
        t.equal(nodeServer, undefined)
        nodeServer = node
        socketServer = node.socket
        tokenServer = node.token
    })
    client.on('connect', function(node) {
        t.equal(nodeClient, undefined)
        nodeClient = node
        socketClient = node.socket
        tokenClient = node.token
    })

    server.on('reconnect', function(node) {
        const nodesByToken = Object.keys(server.nodesByToken).length
        t.equal(
            node === nodeServer && node.socket !== socketServer,
            true,
            'SERVER reconnect'
        )
        t.equal(nodesByToken, 1, 'server nodesByToken 1')
        t.equal(server.nodesBySocket.size, 1, 'server nodesBySocket 1')
    })
    client.on('reconnect', function(node) {
        const nodesByToken = Object.keys(client.nodesByToken).length
        t.equal(
            node === nodeClient && node.socket !== socketClient,
            true,
            'CLIENT reconnect'
        )
        t.equal(nodesByToken, 1, 'client nodesByToken 1')
        t.equal(client.nodesBySocket.size, 1, 'client nodesBySocket 1')
        t.end()
        node.closeSocket() // avoid reconnections
        server.close() // this must terminate the server
    })

    // Disconnecting
    setTimeout(function() {
        // console.log( 'closing...' );
        nodeClient.socket.close()
    }, 500)
})
