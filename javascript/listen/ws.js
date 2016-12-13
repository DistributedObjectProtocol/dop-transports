// https://github.com/websockets/ws
function ws(dop, listener, options) {
        
    // Defaults
    if (options.httpServer !== undefined && options.server === undefined)
        options.server = options.httpServer;
    if (typeof options.port != 'number' && options.server === undefined)
        options.port = 4444;
    if (typeof options.timeout != 'number') // Default timeout we use to disconnect node/client definitely
        options.timeout = 60; // seconds
    // if (typeof options.namespace != 'string') // namespaces are ignored on native WebSockets
        // options.namespace = '/' + dop.name;

    options.perMessageDeflate = false; // https://github.com/websockets/ws/issues/923

    // Creating instance of the (let WebSocketServer = new WebSocketServer() https://github.com/websockets/ws)
    var api = options.transport.getApi(),
        transport = new api(options),
        clients = {};

    // Listening for sockets connections
    transport.on('connection', function(socket) {

        function send(message) {
            (socket.readyState===socket.constructor.OPEN) ?
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
            if (client.readyState === dop.CONS.CONNECT || client.readyState === dop.CONS.CONNECTING)
                dop.core.emitMessage(node, message);

            // Checking if client is trying to reconnect
            else if (oldClient!=undefined && oldClient.readyState===dop.CONS.CONNECTING && client.readyState===dop.CONS.OPEN) {
                node.removeListener(dop.CONS.CONNECT, onconnect);
                node.removeListener(dop.CONS.SEND, send);
                node.removeListener(dop.CONS.DISCONNECT, ondisconnect);
                send(message); // Sending same token/message to confirm the reconnection
                dop.core.emitReconnect(oldClient.node, oldClient.socket, node);
                oldClient.onReconnect(socket);
                delete clients[node.token];
                node = oldClient.node;
                client = oldClient;
            }

            // We send instruction to connect with client
            else if (client.readyState === dop.CONS.OPEN) {
                client.readyState = dop.CONS.CONNECTING;
                dop.core.sendConnect(node);
            }
        }
        function onclose() {
            dop.core.emitClose(node, socket);
            // If node.readyState === dop.CONS.CLOSE means node.disconnect() has been called and we DON'T try to reconnect
            if (client.readyState === dop.CONS.CLOSE)
                dop.core.emitDisconnect(node);
            // We setup node as reconnecting
            else if (client.readyState === dop.CONS.CONNECT) {
                client.timeoutReconnection = setTimeout(
                    ontimeout,
                    options.timeout*1000
                );
                client.readyState = dop.CONS.CONNECTING;
            }

            // Removing listeners
            socket.removeListener('message', onmessage);
            socket.removeListener('close', onclose);
        }

        // dop events
        function onconnect() {
            client.readyState = dop.CONS.CONNECT;
            dop.core.emitConnect(node);
        }
        function ondisconnect() {
            client.readyState = dop.CONS.CLOSE;
            socket.close();
        }

        function ontimeout() {
            delete clients[node.token];
            node.removeListener(dop.CONS.CONNECT, onconnect);
            node.removeListener(dop.CONS.SEND, send);
            node.removeListener(dop.CONS.DISCONNECT, ondisconnect);
            dop.core.emitDisconnect(node);
        }



        var node = dop.core.emitOpen(listener, socket, options.transport); // create a new node instance
        var client = {
            socket: socket,
            node: node, 
            readyState: dop.CONS.OPEN,
            queue: [],
            onReconnect: function(newSocket) {
                socket = newSocket;
                this.socket = newSocket;
                this.readyState = dop.CONS.CONNECT;
                clearTimeout(this.timeoutReconnection);
                delete this.timeoutReconnection;
                dop.core.setSocketToNode(this.node, newSocket);
                sendQueue();
            }
        };


        clients[node.token] = client;
        dop.core.setSocketToNode(node, socket);
        node.on(dop.CONS.CONNECT, onconnect);
        node.on(dop.CONS.SEND, send);
        node.on(dop.CONS.DISCONNECT, ondisconnect);
        socket.on('message', onmessage);
        socket.on('close', onclose);

    });

    return transport;
};

ws.getApi = function() { return require('ws').Server };
module.exports = ws;