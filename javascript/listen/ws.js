// https://github.com/websockets/ws
var listenWs = function ws(dop, listener, options) {

    // if (typeof options.namespace != 'string') // namespaces are ignored on native WebSockets
        // options.namespace = '/' + dop.name;

    if (options.httpServer !== undefined && options.server === undefined)
        options.server = options.httpServer;

    if (typeof options.port != 'number' && options.server === undefined)
        options.port = 4444;

    var api = options.transport.api(),
        transport = new api(options);

    transport.on('connection', function(socket) {

        dop.core.onopen(listener, socket, options.transport);

        socket.on('message', function(message) {
            dop.core.onmessage(listener, socket, message);
        });

        socket.on('close', function() {
            dop.core.onclose(listener, socket);
        });

    });

    return transport;
};

listenWs.api = function() {
    return require('ws').Server;
};
module.exports = listenWs;