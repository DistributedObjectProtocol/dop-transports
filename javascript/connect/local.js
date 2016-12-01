(function(root){
function local(dop, node, options) {
    var listener = options.listener.listener;
    var socket = new dop.util.emitter();
    socket.send = function(message){
        setTimeout(function(){
        listener.onsend(socket, message);
        },10);
    };
    socket.close = function(){
        setTimeout(function(){
        socket.onclose();
        listener.onclose(socket);
        },10);  
    };
    socket.onsend = function(message) {
        dop.core.onmessage(node, socket, message);
        socket.emit('message', message);
    };
    socket.onclose = function(message) {
        dop.core.onclose(node, socket);
        socket.emit('close');
    };
    setTimeout(function(){
        listener.connection(socket);
        dop.core.onopen(node, socket);
        socket.emit('open');
    },10);

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