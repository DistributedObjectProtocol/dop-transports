var test = require('tape')
var transportWebsocket = require('../listen/websocket')
var transportWebsocket2 = require('../').listen.websocket

test('Two ways of loading', function(t) {
    t.equal(transportWebsocket, transportWebsocket2)
    t.equal(typeof transportWebsocket, 'function')
    t.end()
})
