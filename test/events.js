var test = require('tape')
var dop = require('dop')
var dopServer = dop.create()
var dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'

var transportName = process.argv[2] || 'development'
var transportListen = require('../').listen[transportName]
var transportConnect = require('../').connect[transportName]

test('TESTING EVENTS', function(t) {
    var server = dopServer.listen({
        transport: transportListen
    })
    var client = dopClient.connect({
        transport: transportConnect
    })
    var socketServer
    var socketClient
    var closed = false
    server.on('open', function(socket) {
        socketServer = socket
        t.equal(typeof socket, 'object', 'SERVER open')
    })
    client.on('open', function(socket) {
        socketClient = socket
        t.equal(typeof socket, 'object', 'CLIENT open')
    })
    server.on('message', function(socket, message) {
        t.equal(socket, socketServer, 'SERVER message socket')
        t.equal(typeof message, 'string', 'SERVER message message')
    })
    client.on('message', function(socket, message) {
        t.equal(socket, socketClient, 'CLIENT message socket')
        t.equal(typeof message, 'string', 'CLIENT message message')
    })
    server.on('close', function(socket) {
        if (!closed) t.equal(socket, socketServer, 'SERVER close')
    })
    client.on('close', function(socket) {
        if (!closed) t.equal(socket, socketClient, 'CLIENT close')
    })
    client.on('error', function(socket, error) {
        t.notEqual(socket, socketClient, 'CLIENT error')
        t.equal(typeof error, 'object')
        closed = true
        server = dopServer.listen({
            transport: transportListen
        })
        server.on('reconnect', function(node) {
            t.equal(node, nodeServer, 'SERVER reconnect')
        })
        server.on('disconnect', function(node) {
            t.equal(node, nodeServer, 'SERVER disconnect')
        })
    })
    setTimeout(function() {
        server.close()
    }, 1000)

    var nodeServer
    var nodeClient
    server.on('connect', function(node) {
        nodeServer = node
        t.equal(typeof node, 'object', 'SERVER connect')
        node.on('reconnecting', function(arg) {
            t.equal(arg, undefined, 'SERVER-NODE reconnecting')
        })
        node.on('reconnect', function(arg) {
            t.equal(arg, undefined, 'SERVER-NODE reconnect')
        })
        node.on('disconnect', function(arg) {
            t.equal(arg, undefined, 'SERVER-NODE disconnect')
        })
    })
    client.on('connect', function(node) {
        nodeClient = node
        t.equal(typeof node, 'object', 'CLIENT connect')
        node.on('reconnecting', function(arg) {
            t.equal(arg, undefined, 'CLIENT-NODE reconnecting')
        })
        node.on('reconnect', function(arg) {
            t.equal(arg, undefined, 'CLIENT-NODE reconnect')
        })
        node.on('disconnect', function(arg) {
            t.equal(arg, undefined, 'CLIENT-NODE disconnect')
        })
    })
    server.on('reconnecting', function(node) {
        t.equal(node, nodeServer, 'SERVER reconnecting')
    })
    client.on('reconnecting', function(node) {
        t.equal(node, nodeClient, 'CLIENT reconnecting')
    })
    client.on('reconnect', function(node) {
        t.equal(node, nodeClient, 'CLIENT reconnect')
        node.disconnect()
    })
    client.on('disconnect', function(node) {
        t.equal(node, nodeClient, 'CLIENT disconnect')

        server.close() // this must terminate the server
        t.end()
    })
})
