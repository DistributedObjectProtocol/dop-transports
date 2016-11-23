// http://socket.io/docs/server-api/
var listenSockjs = function sockjs(dop, listener, options) {

    if (options.server !== undefined && options.httpServer === undefined)
        options.httpServer = options.server;

    if (typeof options.httpServer == 'undefined') {
        options.httpServer = require('http').createServer();
        options.httpServer.listen((typeof options.port != 'number') ? 4446 : options.port, '0.0.0.0');
    }

    if (typeof options.prefix != 'string')
        options.prefix = (typeof options.namespace == 'string') ? options.namespace : '/'+dop.name;

    if (options.prefix[0] != '/')
        options.prefix = '/'+options.prefix;

    var transport = options.transport.api.createServer(options);

    transport.installHandlers( options.httpServer, options );

    transport.on('connection', function(socket) {

        socket.send = function(message) {
            socket.write(message);
        };

        dop.core.onopen(listener, socket, options.transport);

        socket.on('data', function(message) {
            dop.core.onmessage(listener, socket, message);
        });

        socket.on('close', function() {
            dop.core.onclose(listener, socket);
        });
    });


    return transport;
};

listenSockjs.api = require('sockjs');

module.exports = listenSockjs;