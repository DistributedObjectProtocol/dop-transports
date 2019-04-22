// THIS SCRIPT DOES NOT MAKE SENSE BECAUSE:
// https://stackoverflow.com/questions/32474023/can-websocket-messages-get-lost-or-not

var test = require('tape')
var dop = require('dop')
var dopServer = dop.create()
var dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'
var transportName = process.argv[2] || 'websocket'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('QUEUE TEST', function(t) {
    var server = dopServer.listen({ transport: transportListen })
    dopClient
        .connect({
            timeoutReconnect: 0.1,
            transport: transportConnect,
            listener: server
        })
        .then(function(nodeClient) {
            var nodeServer
            var msg = 0
            var maxMsg = 10
            function send() {
                nodeClient.send(String(msg))
                nodeServer.send(String(msg))
                msg += 1
                if (msg < maxMsg) setTimeout(send, 100)
            }

            var incS = 0,
                incC = 0

            server.on('connect', function(node) {
                nodeServer = node
                send()
            })
            nodeClient.on('message', function(message) {
                incC += 1
                // t.equal(
                //     message,
                //     String(incC++),
                //     'CLIENT message `' + message + '`'
                // )
            })
            server.on('message', function(node, message) {
                incS += 1
                // t.equal(
                //     message,
                //     String(incS),
                //     'SERVER message `' + message + '`'
                // )
                if (incS === maxMsg && incC === maxMsg) {
                    console.log('CLOSSING!!')
                    t.end()
                    // server.disconnectAll()
                    // server.socket.close()
                    // nodeClient.socket.close()
                    // nodeClient.closeSocket()
                }
            })

            setTimeout(function() {
                console.log('closing...')
                nodeClient.socket.close()
            }, 400)

            // setTimeout(function() {
            //     console.log('closing2...')
            //     nodeServer.socket.close()
            // }, 800)
        })
})
