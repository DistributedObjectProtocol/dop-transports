var test = require('tape')
var dop = require('dop').create()
var dopServer = dop.create()
var dopClient = dop.create()

var transportName = process.argv[2] || 'local'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('RECONNECTFAIL TEST', function(t) {
    var server = dopServer.listen({
        transport: transportListen,
        timeout: 5
    })
    dopClient
        .connect({
            transport: transportConnect,
            timeoutReconnect: 10,
            listener: server
        })
        .then(function(nodeClient) {
            dopServer.env = 'SERVER'
            dopClient.env = 'CLIENT'
            var nodeServer

            server.on('connect', function(node) {
                nodeServer = node
                tokenServer = node.token
                t.equal(true, true, 'SERVER connect')
            })
            server.on('disconnect', function(node) {
                t.equal(node, nodeServer, 'SERVER disconnect')
            })
            server.on('reconnect', function(node, oldSocket) {
                t.equal(false, true, 'SERVER this should not happen') // this should not happen
            })

            nodeClient.on('disconnect', function() {
                t.equal(nodeClient.token, nodeServer.token, 'CLIENT disconnect')
            })
            nodeClient.on('reconnect', function(oldSocket) {
                t.equal(true, false, 'CLIENT this should not happen') // this should not happen
            })

            // Disconnecting
            setTimeout(function() {
                // console.log( 'closing...' );
                nodeClient.socket.close()
            }, 2500)
        })
})
