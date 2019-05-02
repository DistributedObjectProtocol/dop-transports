var test = require('tape')
var dop = require('dop')
var transportWebsocket = require('../listen/websocket')
var transportWebsocket2 = require('../').listen.websocket

var server
var client

test('Two ways of loading', function(t) {
    t.equal(transportWebsocket, transportWebsocket2)
    t.equal(typeof transportWebsocket, 'function')
    t.end()
})

test('Api transport', function(t) {
    server = dop.listen({})
    client = dop.connect({})
    t.equal(typeof server.on, 'function')
    t.equal(typeof client.on, 'function')
    t.end()
})

test('Api node', function(t) {
    function check(node) {
        t.equal(typeof node.on, 'function')
        t.equal(typeof node.send, 'function')
        t.equal(typeof node.disconnect, 'function')
        t.equal(typeof node.transport, 'object')
    }
    server.on('connect', check)
    client.on('connect', function(node) {
        check(node)
        server.socket.close()
        t.end()
    })
})
