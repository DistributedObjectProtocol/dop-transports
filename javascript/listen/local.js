(function(root){
function local(dop, listener, options) {
    var transport = new dop.util.emitter();
    transport.connection = function(socketClient) {
        var socket = new dop.util.emitter();
        socket.send = function(message){
            socketClient.onsend(message);
        };
        socket.close = function(){};
        transport.emit('connection', socket);
        dop.core.onopen(listener, socket, options.transport);
    };
    transport.onsend = function(message) {
        dop.core.onmessage(listener, socket, message);
    };
    

    return transport;
};

if (typeof dop=='undefined' && typeof module == 'object' && module.exports)
    module.exports = local;
else {
    (typeof dop != 'undefined') ?
        dop.transports.listen.local = local
    :
        root.dopTransportsListenlocal = local;
}

})(this);