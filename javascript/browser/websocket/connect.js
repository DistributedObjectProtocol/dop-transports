(function(){

var websocketConnect = function(options, dop, node) {

    var domain_prefix = /(ss|ps)?:\/\/([^\/]+)\/?(.+)?/.exec(options.url || window.location.href),
        protocol = domain_prefix[1] ? 'wss' : 'ws',
        socket = new options.transport.api(protocol+'://'+domain_prefix[2].toLocaleLowerCase()+'/', domain_prefix[3] || dop.name);

    socket.addEventListener('open', function() {
        dop.core.onopen(node, socket);
    });

    socket.addEventListener('message', function(message) {
        dop.core.onmessage(node, socket, message.data, message);
    });

    socket.addEventListener('close', function() {
        dop.core.onclose(node, socket);
    });

    // socket.addEventListener('error', function(error) {
    //     dop.on.error(node, error);
    // });

    return socket;
};


// Browser
if (typeof dop == 'object')
    dop.transport.websocketConnect = websocketConnect;

// Node
if (typeof module == 'object' && module.exports)
    module.exports = websocketConnect;

})()