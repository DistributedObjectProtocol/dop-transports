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
    t.equal(typeof server.onCreate, 'function')
    t.equal(typeof server.onConnect, 'function')
    t.equal(typeof server.onMessage, 'function')
    t.equal(typeof server.onDisconnect, 'function')
    t.equal(typeof server.onError, 'function')
    t.equal(typeof client.on, 'function')
    t.equal(typeof client.onCreate, 'function')
    t.equal(typeof client.onConnect, 'function')
    t.equal(typeof client.onMessage, 'function')
    t.equal(typeof client.onDisconnect, 'function')
    t.equal(typeof client.onError, 'function')
    t.equal(typeof server.socket, 'object')
    t.end()
})

test('Api node', function(t) {
    function check(node) {
        t.equal(typeof node.on, 'function')
        t.equal(typeof node.status, 'string')
        t.equal(typeof node.transport, 'object')
        t.equal(typeof node.send, 'function')
        t.equal(typeof node.subscribe, 'function')
        t.equal(typeof node.unsubscribe, 'function')
    }
    server.on('connect', check)
    client.on('connect', function(node) {
        check(node)
        server.socket.close()
        t.end()
    })
})
