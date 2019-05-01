var test = require('tape')
var dop = require('dop')
var dopServer = dop.create()
var dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'
var transportName = process.argv[2] || 'development'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('QUEUE TEST', function(t) {
    var server = dopServer.listen({ transport: transportListen })
    var client = dopClient.connect({
        timeoutReconnect: 100,
        transport: transportConnect,
        listener: server
    })

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
        node.on('message', function(message) {
            t.equal(message, String(incS), 'SERVER message `' + message + '`')
            incS += 1
            if (incS === maxMsg && incC === maxMsg) {
                t.end()
                nodeClient.closeSocket() // avoid reconnections
                server.close()
            }
        })
    })
    client.on('connect', function(node) {
        nodeClient = node
        node.on('message', function(message) {
            t.equal(message, String(incC), 'CLIENT message `' + message + '`')
            incC += 1
        })
        send()
    })

    setTimeout(function() {
        // console.log('closing...')
        nodeClient.socket.close()
    }, 400)

    setTimeout(function() {
        // console.log('closing2...')
        nodeServer.socket.close()
    }, 800)
})
