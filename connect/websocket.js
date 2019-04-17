function websocket(dop, options) {
    var url = 'ws://localhost:4444/' + dop.name
    if (typeof options.url == 'string') url = options.url.replace('http', 'ws')
    else if (
        typeof window != 'undefined' &&
        typeof window.location != 'undefined' &&
        /http/.test(window.location.href)
    ) {
        var domain_prefix = /(ss|ps)?:\/\/([^\/]+)\/?(.+)?/.exec(
                window.location.href
            ),
            protocol = domain_prefix[1] ? 'wss' : 'ws'
        url =
            protocol +
            '://' +
            domain_prefix[2].toLocaleLowerCase() +
            '/' +
            dop.name
    }

    var transport = dop.createTransport()
    var WebSocket = options.transport.getApi()
    ;(function reconnect(wsClientOld) {
        var keepReconnecting = true
        var wsClient = new WebSocket(url)
        var send = wsClient.send.bind(wsClient)
        var close = () => {
            keepReconnecting = false
            wsClient.close()
        }
        wsClient.addEventListener('open', function() {
            if (wsClientOld === undefined) {
                transport.onOpen(wsClient, send, close)
            } else {
                transport.onReconnect(wsClientOld, wsClient, send, close)
            }
        })
        wsClient.addEventListener('message', function(message) {
            transport.onMessage(wsClient, message)
        })
        wsClient.addEventListener('close', function() {
            transport.onClose(wsClient)
            if (keepReconnecting) reconnect(wsClient)
        })
        wsClient.addEventListener('error', function(error) {
            keepReconnecting = false
            transport.onError(wsClient, error)
        })
    })()
}

websocket.getApi = function() {
    return window.WebSocket
}
