
var connectSocketio = function(dop, node, options) {

    var url = 'ws://localhost:4445/'+dop.name;

    if (typeof options.url == 'string')
        url = options.url;

    var socket = options.transport.api( url );

    socket.on('connect', function () {
        dop.core.onopen(node, socket);
    });

    socket.on('message', function ( message ) {
        dop.core.onmessage(node, socket, message);
    });

    socket.on('disconnect', function () {
        dop.core.onclose(node, socket);
    });

    return socket;
};


if (typeof module == 'object' && module.exports) {
    connectSocketio.api = require('socket.io-client');
    module.exports = connectSocketio;
}
else
    connectSocketio.api = window.io;
    