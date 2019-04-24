var test = require('tape')
var dop = require('dop').create()
var dopServer = dop.create()
var dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'

var transportName = process.argv[2] || 'local'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('CONNECT TEST', function(t) {
    var server = dopServer.listen({
        transport: transportListen
    })
    var client = dopClient.connect({
        transport: transportConnect,
        listener: server
    })
    var tokenServer
    server.on('connect', function(node) {
        tokenServer = node
        t.equal(true, true, 'SERVER connect')
    })
    client.on('connect', function(node) {
        t.equal(tokenServer.token, node.token, 'CLIENT connect')
        t.equal(tokenServer.token_local, node.token_remote)
        t.equal(tokenServer.token_remote, node.token_local)
        node.closeSocket() // avoid reconnections
        server.close() // this must terminate the server
        t.end()
    })
})
