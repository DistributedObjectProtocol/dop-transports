(function(root){
function local(dop, listener, options) {
    var transport = new dop.util.emitter(),
        closed = false,
        clients = {};

    // Listening for sockets connections
    transport.on('connection', function(socket) {

        function send(message) {
            (socket.readyState===OPEN) ?
                socket.send(message)
            :
                client.queue.push(message); 
        }
        function sendQueue() {
            while (client.queue.length>0)
                socket.send(client.queue.shift());
        }


        // Socket events
        function onmessage(message) {
            // console.log( 'S<<: `'+message+'`' );
            var oldClient = clients[message];
            // Emitting message
            if (client.readyState === CONNECT)
                dop.core.emitMessage(node, message);

            // Checking if client is trying to reconnect
            else if (oldClient!=undefined && oldClient.readyState===CONNECTING && client.readyState===OPEN) {
                // node.removeListener(dop.cons.CONNECT, onconnect);
                client.readyState = CONNECT;
                node.removeListener(dop.cons.SEND, send);
                node.removeListener(dop.cons.DISCONNECT, ondisconnect);
                send(message); // Sending same token/message to confirm the reconnection
                dop.core.emitReconnect(oldClient.node, oldClient.socket, node);
                oldClient.onReconnect(socket);
                delete clients[node.token];
                node = oldClient.node;
                client = oldClient;
            }

            // If
            else if (client.readyState === CONNECTING && message === node.token) {
                client.readyState = CONNECT;
                dop.core.emitConnect(node);
            }

            // We send instruction to connect with client
            else if (client.readyState === OPEN) {
                client.readyState = CONNECTING;
                send(node.token);
                // dop.core.sendConnect(node);
            }
        }
        function onclose() {
            dop.core.emitClose(node, socket);
            // If node.readyState === CLOSE means node.disconnect() has been called and we DON'T try to reconnect
            if (client.readyState === CLOSE || closed === true)
                dop.core.emitDisconnect(node);
            // We setup node as reconnecting
            else if (client.readyState === CONNECT && closed === false) {
                client.timeoutReconnection = setTimeout(
                    ontimeout,
                    options.timeout*1000
                );
                client.readyState = CONNECTING;
            }

            // Removing listeners
            socket.removeListener('message', onmessage);
            socket.removeListener('close', onclose);
        }

        // dop events
        // function onconnect() {
        //     client.readyState = CONNECT;
        //     dop.core.emitConnect(node);
        // }
        function ondisconnect() {
            client.readyState = CLOSE;
            socket.close();
        }

        function ontimeout() {
            delete clients[node.token];
            // node.removeListener(dop.cons.CONNECT, onconnect);
            node.removeListener(dop.cons.SEND, send);
            node.removeListener(dop.cons.DISCONNECT, ondisconnect);
            dop.core.emitDisconnect(node);
        }



        var node = dop.core.emitOpen(listener, socket, options.transport); // create a new node instance
        var client = {
            socket: socket,
            node: node, 
            readyState: OPEN,
            queue: [],
            onReconnect: function(newSocket) {
                socket = newSocket;
                this.socket = newSocket;
                this.readyState = CONNECT;
                clearTimeout(this.timeoutReconnection);
                delete this.timeoutReconnection;
                dop.core.setSocketToNode(this.node, newSocket);
                sendQueue();
            }
        };


        clients[node.token] = client;
        dop.core.setSocketToNode(node, socket);
        // node.on(dop.cons.CONNECT, onconnect);
        node.on(dop.cons.SEND, send);
        node.on(dop.cons.DISCONNECT, ondisconnect);
        socket.on('message', onmessage);
        socket.on('close', onclose);
    });

    transport.close = function(){
        closed = true;
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

// Cons
var CLOSE = 0,
    OPEN = 1,
    CONNECTING = 2,
    CONNECT = 3;

})(this);