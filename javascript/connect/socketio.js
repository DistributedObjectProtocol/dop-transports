// https://github.com/socketio/socket.io
var connectSocketio = function socketio(dop, node, options) {

    var url = 'ws://localhost:4445/'+dop.name;

    if (typeof options.url == 'string')
        url = options.url;
    else if (typeof window!='undefined' && /http/.test(window.location.href)) {
        var domain_prefix = /(ss|ps)?:\/\/([^\/]+)\/?(.+)?/.exec(window.location.href),
            protocol = domain_prefix[1] ? 'wss' : 'ws';
        url = protocol+'://'+domain_prefix[2].toLocaleLowerCase()+'/'+dop.name;
    }

    var socket = options.transport.api()( url );

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
    connectSocketio.api = function() { 
        return require('socket.io-client');
    };
    module.exports = connectSocketio;
}
else
    connectSocketio.api = function() { 
        return window.io;
    };
    