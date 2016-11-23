
var connectSockjs = function sockjs(dop, node, options) {

    var url = 'http://localhost:4446/'+dop.name;

    if (typeof options.url == 'string')
        url = options.url.replace('ws','http');
    else if (typeof window!='undefined' && /http/.test(window.location.href)) {
        var domain_prefix = /(ss|ps)?:\/\/([^\/]+)\/?(.+)?/.exec(window.location.href),
            protocol = domain_prefix[1] ? 'https' : 'http';
        url = protocol+'://'+domain_prefix[2].toLocaleLowerCase()+'/'+dop.name;
    }

    var socket = new options.transport.api(url);
        send = socket.send,
        send_queue = [];

    socket.send = function(message) {
        (socket.readyState !== 1) ?
            send_queue.push(message)
        :
            send.call(socket, message);
    };

    socket.addEventListener('open', function() {
        dop.core.onopen(node, socket);
        while (send_queue.length>0)
            send.call(socket, send_queue.shift());
    });

    socket.addEventListener('message', function(message) {
        dop.core.onmessage(node, socket, message.data, message);
    });

    socket.addEventListener('close', function() {
        dop.core.onclose(node, socket);
    });

    // socket.addEventListener('error', function( error ) {
    // });

    return socket;
};


if (typeof module == 'object' && module.exports) {
    connectSockjs.api = require('sockjs-client');
    module.exports = connectSockjs;
}
else
    sockjs.api = window.SockJS;
    