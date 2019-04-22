var test = require('tape')
var dop = require('dop').create()
var dopServer = dop.create()
var dopClient = dop.create()

var transportName = process.argv[2] || 'local'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('RECONNECT TEST', function(t) {
    var server = dopServer.listen({ transport: transportListen, timeout: 1.5 })
    dopClient
        .connect({
            transport: transportConnect,
            listener: server
        })
        .then(function(nodeClient) {
            dopServer.env = 'SERVER'
            dopClient.env = 'CLIENT'
            var nodeServer, socketServer, socketClient

            server.on('connect', function(node) {
                nodeServer = node
                socketServer = node.socket
                tokenServer = node.token
            })
            server.on('reconnect', function(node) {
                t.equal(
                    node === nodeServer && node.socket !== socketServer,
                    true,
                    'SERVER reconnect'
                )
            })
            nodeClient.on('reconnect', function(oldSocket) {
                t.equal(nodeClient.token, nodeServer.token, 'CLIENT reconnect')
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
