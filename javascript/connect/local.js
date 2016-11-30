(function(root){
function local(dop, node, options) {
    var listener = options.listener.transport;
    var socket = new dop.util.emitter();
    socket.send = function(message){
        // listener.on
    };
    socket.close = function(){};
    socket.onsend = function(message) {
        socket.emit('message', message);
        dop.core.onmessage(node, socket, message);
    };
    setTimeout(function(){
        listener.connection(socket);
        socket.emit('open');
        dop.core.onopen(node, socket);
    },0);

    return socket;
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