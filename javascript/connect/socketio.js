// https://github.com/socketio/socket.io
(function(root){
function socketio(dop, node, options) {

    var url = 'ws://localhost:4445/'+dop.name;

    if (typeof options.url == 'string')
        url = options.url;
    else if (typeof window!='undefined' && /http/.test(window.location.href)) {
        var domain_prefix = /(ss|ps)?:\/\/([^\/]+)\/?(.+)?/.exec(window.location.href),
            protocol = domain_prefix[1] ? 'wss' : 'ws';
        url = protocol+'://'+domain_prefix[2].toLocaleLowerCase()+'/'+dop.name;
    }

    var api = options.transport.api(),
        socket = new api( url );

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
    socketio.api = function() { return require('socket.io-client') };
    module.exports = socketio;
}
else {
    socketio.api = function() { return window.io };
    (typeof dop != 'undefined') ?
        dop.transports.connect.socketio = socketio
    :
        root.dopTransportsConnectSocketio = socketio;
}

})(this);
    