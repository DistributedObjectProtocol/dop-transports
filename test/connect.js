var test = require('tape')
var dop = require('dop')
var dopServer = dop.create()
var dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'

var transportName = process.argv[2] || 'development'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('CONNECT TEST', function(t) {
    var server = dopServer.listen({
        transport: transportListen
    })
    var client = dopClient.connect({
        transport: transportConnect
    })
    var nodeServer
    server.on('connect', function(node) {
        nodeServer = node
        t.equal(true, true, 'SERVER connect')
    })
    client.on('connect', function(node) {
        t.equal(nodeServer.token, node.token, 'CLIENT connect')
        t.equal(nodeServer.status, dop.cons.NODE_STATE_CONNECTED)
        t.equal(node.status, dop.cons.NODE_STATE_CONNECTED)
        node.closeSocket() // avoid reconnections
        server.close() // this must terminate the server
        t.end()
    })
})
