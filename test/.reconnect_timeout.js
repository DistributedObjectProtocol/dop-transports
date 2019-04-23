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
        transport: transportListen,
        timeout: 0.5
    })
    const nodeClient = await dopClient.connect({
        transport: transportConnect,
        timeoutReconnect: 1,
        listener: server
    })

    let nodeServer

    server.on('connect', function(node) {
        nodeServer = node
        tokenServer = node.token
        t.equal(true, true, 'SERVER connect')
    })
    server.on('disconnect', function(node) {
        t.equal(node, nodeServer, 'SERVER disconnect')
    })
    server.on('reconnect', function(node, oldSocket) {
        t.equal(false, true, 'SERVER this should not happen') // this should not happen
    })

    nodeClient.on('disconnect', function() {
        t.equal(nodeClient.token, nodeServer.token, 'CLIENT disconnect')
        t.equal(
            Object.keys(server.nodesByToken).length,
            0,
            'server nodesByToken 0'
        )
        t.equal(server.nodesBySocket.size, 0, 'server nodesBySocket 0')
        // t.equal(
        //     Object.keys(nodeClient.transport.nodesByToken).length,
        //     0,
        //     'client nodesByToken 0'
        // )
    })
    nodeClient.on('reconnect', function(oldSocket) {
        t.equal(true, false, 'CLIENT this should not happen') // this should not happen
    })

    // Disconnecting
    setTimeout(function() {
        // console.log( 'closing...' );
        nodeClient.socket.close()
    }, 250)
})
