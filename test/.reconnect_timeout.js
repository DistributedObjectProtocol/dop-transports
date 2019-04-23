const test = require('tape')
const dop = require('dop').create()
const dopServer = dop.create()
const dopClient = dop.create()
dopServer.env = 'SERVER'
dopClient.env = 'CLIENT'

const transportName = process.argv[2] || 'local'
const transportListen = require('../').listen[transportName]
const transportConnect = require('../').connect[transportName]

test('RECONNECTFAIL TEST', async t => {
    const server = dopServer.listen({
        transport: transportListen
    })
    const nodeClient = await dopClient.connect({
        transport: transportConnect,
        timeoutReconnect: 10,
        listener: server
    })

    let nodeServer

    server.on('connect', function(node) {
        nodeServer = node
        tokenServer = node.token
        t.equal(true, true, 'SERVER connect')
    })
    server.on('disconnect', function(node) {
        const nodesByToken = Object.keys(server.nodesByToken).length
        t.equal(node, nodeServer, 'SERVER disconnect')
        t.equal(nodesByToken, 0, 'server nodesByToken 0')
        t.equal(server.nodesBySocket.size, 0, 'server nodesBySocket 0')
    })
    server.on('reconnect', function(node, oldSocket) {
        t.equal(false, true, 'SERVER this should not happen') // this should not happen
    })

    nodeClient.on('disconnect', function() {
        const nodesByToken = Object.keys(nodeClient.transport.nodesByToken)
            .length
        t.equal(nodeClient.token, nodeServer.token, 'CLIENT disconnect')
        t.equal(nodesByToken, 0, 'client nodesByToken 0')
        t.equal(
            nodeClient.transport.nodesBySocket.size,
            0,
            'client nodesBySocket 0'
        )
    })
    nodeClient.on('reconnect', function(oldSocket) {
        t.equal(true, false, 'CLIENT this should not happen') // this should not happen
    })

    // Disconnecting
    setTimeout(function() {
        nodeClient.socket.close()
    }, 250)
    setTimeout(function() {
        nodeServer.disconnect()
    }, 5000)
})
