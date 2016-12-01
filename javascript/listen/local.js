(function(root){
function local(dop, listener, options) {
    var transport = new dop.util.emitter();
    transport.connection = function(socketClient) {
        var socket = new dop.util.emitter();
        socketClient.socket = socket;
        socket.send = function(message){
            setTimeout(function(){
                socketClient.onsend(message);
            },10)
        };
        socket.close = function(){};
        dop.core.onopen(listener, socket, options.transport);
        transport.emit('connection', socket);
    };
    transport.onsend = function(socketClient, message) {
        dop.core.onmessage(listener, socketClient.socket, message);
        socketClient.socket.emit('message', message);
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