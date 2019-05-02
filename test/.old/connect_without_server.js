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
    var server
    var client = dopClient.connect({
        transport: transportConnect,
        timeoutReconnect: 10
        // listener: server
    })

    var nodeClient, socketClient, tokenClient

    client.on('connect', function(node) {
        t.equal(nodeClient, undefined, 'CLIENT connect')
        nodeClient = node
        socketClient = node.socket
        tokenClient = node.token
        server.close()
        setTimeout(function() {
            server = dopServer.listen({ transport: transportListen })
        }, 3000)
    })

    client.on('error', function(socket) {
        t.equal(typeof socket, 'object', 'CLIENT onerror')
    })

    client.on('close', function(socket) {
        t.equal(typeof socket, 'object', 'CLIENT onclose')
    })

    client.on('disconnect', function(node) {
        t.equal(true, false, 'CLIENT ondisconnect should not happen')
    })

    client.on('reconnect', function(node) {
        t.equal(
            node.status,
            dop.cons.NODE_STATUS_CONNECTED,
            'CLIENT onreconnect'
        )
        t.equal(node, nodeClient)
        t.equal(node.token, tokenClient)
        t.notEqual(node.socket, socketClient)
        t.end()
        nodeClient.closeSocket() // avoid reconnections
        server.close()
    })

    setTimeout(function() {
        server = dopServer.listen({ transport: transportListen })
    }, 3000)
})
