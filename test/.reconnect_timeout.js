const test = require('tape')
const dop = require('dop').create()
const dopServer = dop //.create()
const dopClient = dop //.create()

const transportName = process.argv[2] || 'local'
const transportListen = require('../').listen[transportName]
const transportConnect = require('../').connect[transportName]

test('RECONNECTFAIL TEST', async t => {
    const server = dopServer.listen({
        transport: transportListen,
        timeout: 5
    })
    const nodeClient = await dopClient.connect({
        transport: transportConnect,
        timeoutReconnect: 10,
        listener: server
    })
    dopServer.env = 'SERVER'
    dopClient.env = 'CLIENT'
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
    })
    nodeClient.on('reconnect', function(oldSocket) {
        t.equal(true, false, 'CLIENT this should not happen') // this should not happen
    })

    // Disconnecting
    setTimeout(function() {
        // console.log( 'closing...' );
        nodeClient.socket.close()
    }, 2500)
})
