function createServerTransport(server) {
    const sockets = []

    function onOpen(socket, send) {
        console.log('SERVER.onOpen')
    }

    function onMessage(socket, message) {
        console.log('SERVER.onMessage: %s', message)
    }

    function onClose(socket) {
        console.log('SERVER.onClose')
    }

    function onError(socket) {}

    return {
        onOpen: onOpen,
        onMessage: onMessage,
        onClose: onClose,
        onError: onError,
        server: server
    }
}

module.exports = createServerTransport
