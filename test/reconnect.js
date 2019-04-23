var test = require('tape')
var dop = require('dop').create()
var dopServer = dop.create()
var dopClient = dop.create()

var transportName = process.argv[2] || 'local'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('RECONNECT TEST', function(t) {
    var server = dopServer.listen({ transport: transportListen })
    dopClient
        .connect({
            transport: transportConnect,
            listener: server
        })
        .then(function(nodeClient) {
            dopServer.env = 'SERVER'
            dopClient.env = 'CLIENT'
            var nodeServer, socketServer

            server.on('connect', function(node) {
                nodeServer = node
                socketServer = node.socket
                tokenServer = node.token
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
            nodeClient.on('reconnect', function() {
                const nodesByToken = Object.keys(
                    nodeClient.transport.nodesByToken
                ).length
                t.equal(nodeClient.token, nodeServer.token, 'CLIENT reconnect')
                t.equal(nodesByToken, 1, 'client nodesByToken 1')
                t.equal(
                    nodeClient.transport.nodesBySocket.size,
                    1,
                    'client nodesBySocket 1'
                )
                t.end()
                try {
                    server.socket.close()
                    nodeClient.socket.close()
                } catch (e) {
                    // process.exit();
                }
            })

            // Disconnecting
            setTimeout(function() {
                // console.log( 'closing...' );
                nodeClient.socket.close()
            }, 500)
        })
})
