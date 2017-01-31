(function(root){
function local(dop, node, options) {
    var server = options.listener.listener,
        sockets = api(dop, server),
        socket = sockets.client,
        tokenServer,
        send_queue = [],
        readyState,
        oldSocket;


    // Helpers
    function send(message) {
        (socket.readyState===OPEN) ?
            socket.send(message)
        :
            send_queue.push(message); 
    }
    function sendQueue() {
        if (socket.readyState===OPEN)
            while (send_queue.length>0)
                socket.send(send_queue.shift());
    }

    // Socket events
    function onopen() {
        // Reconnect
        if (readyState === CONNECTING)
            socket.send(tokenServer);
        // Connect
        else {
            socket.send(''); // Empty means we want to get connected
            readyState = OPEN;
        }
        dop.core.emitOpen(node, socket, options.transport);
    }
    function onmessage(message) {
        // console.log( 'C<<: `'+message.data+'`' );
        // Reconnecting
        if (readyState===CONNECTING && message===tokenServer) {
            readyState = CONNECT;
            dop.core.setSocketToNode(node, socket);
            dop.core.emitReconnect(node, oldSocket);
            sendQueue();
        }
        else if (readyState !== CONNECT) {
            tokenServer = message;
            readyState = CONNECT;
            dop.core.setSocketToNode(node, socket);
            send(tokenServer);
            sendQueue();
            dop.core.emitConnect(node);
        }
        else
            dop.core.emitMessage(node, message);
    }
    function onclose() {
        readyState = CLOSE;
        dop.core.emitClose(node, socket);
        dop.core.emitDisconnect(node);
    }

    // dop events
    // function onconnect() {
    //     if (readyState === CONNECTING) {
    //         dop.core.emitDisconnect(node);
    //         dop.core.setSocketToNode(node, socket);
    //     }
    //     readyState = CONNECT;
    //     dop.core.emitConnect(node);
    //     sendQueue();
    // }
    function ondisconnect() {
        readyState = CLOSE;
        socket.close();
    }

    function reconnect() {
        if (readyState === CLOSE) {
            oldSocket = socket;
            sockets = api(dop, server);
            socket = sockets.client;
            readyState = CONNECTING;
            addListeners(socket, onopen, onmessage, onclose);
            removeListeners(oldSocket, onopen, onmessage, onclose);
        }
    }

    // Setting up
    dop.core.setSocketToNode(node, socket);
    readyState = CLOSE;
    node.reconnect = reconnect;
    // node.on(dop.cons.CONNECT, onconnect);
    node.on(dop.cons.SEND, send);
    node.on(dop.cons.DISCONNECT, ondisconnect);
    addListeners(socket, onopen, onmessage, onclose);
    



    return socket.client;
};

function addListeners(socket, onopen, onmessage, onclose) {
    socket.on('open', onopen);
    socket.on('message', onmessage);
    socket.on('close', onclose);
}
function removeListeners(socket, onopen, onmessage, onclose) {
    socket.removeListener('open', onopen);
    socket.removeListener('message', onmessage);
    socket.removeListener('close', onclose);
}


// This function creates two sockets with the same api as a normal websocket
function api(dop, server) {
    var socket = {
        server:new dop.util.emitter(), 
        client:new dop.util.emitter()
    };
    socket.server.readyState = socket.client.readyState = CLOSE;
    socket.server.send = function(message) {
        // console.log( 'S->', '`'+message+'`' );
        setTimeout(function(){
            socket.client.emit('message', message);
        },50)
    };
    socket.client.send = function(message) {
        // console.log( 'C->', '`'+message+'`' );
        setTimeout(function(){
            socket.server.emit('message', message);
        },50)
    };
    socket.server.close = 
    socket.client.close = function(message) {
        socket.server.readyState = socket.client.readyState = CLOSE;
        socket.client.emit('close', message);
        socket.server.emit('close', message);
    };
    // Simulating connection with a delay of 10ms
    setTimeout(function(){
        socket.server.readyState = socket.client.readyState = OPEN;
        server.emit('connection', socket.server);
        socket.client.emit('open');
    }, 20);
    return socket;
}



if (typeof module == 'object' && module.exports)
    module.exports = local;
else {
    (typeof dop != 'undefined') ?
        dop.transports.connect.local = local
    :
        root.dopTransportsConnectlocal = local;
}

// Cons
var CLOSE = 0,
    OPEN = 1,
    CONNECTING = 2,
    CONNECT = 3;

})(this);