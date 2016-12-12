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
        transport = new api(options);


    // Listening for sockets connections
    transport.on('connection', function(socket) {

        // We emit the connection and create a new node instance
        var node = dop.core.emitOpen(listener, socket, options.transport),
            send_queue = [];

        // Helpers
        function send(message) {
            (socket.readyState === socket.constructor.OPEN) ? socket.send(message) : send_queue.push(message);
        }
        function sendQueue(message) {
            while (send_queue.length>0)
                send(send_queue.shift());
        }

        // Socket events
        function onmessage(message) {
            // Checking if client is trying to reconnect
            var oldNode = dop.data.node[message];
            if (oldNode != undefined && oldNode.readyState === dop.CONS.RECONNECT && node.readyState === dop.CONS.OPEN) {
                send(message); // Sending same token/message to confirm the reconnection
                node.readyState = dop.CONS.CLOSE;
                oldNode.readyState = dop.CONS.CONNECT;
                clearTimeout(oldNode.timeoutReconnection);
                delete oldNode.timeoutReconnection;
                var oldSocket = oldNode.socket;
                dop.core.setSocketToNode(node, socket);
                dop.core.emitReconnect(oldNode, oldSocket, node);
                node = oldNode;
            }
            else {
                // Emitting message
                if (!(node.readyState===dop.CONS.OPEN && message===''))
                    dop.core.emitMessage(node, message);

                // We send instrunction to connect with client
                if (node.readyState === dop.CONS.OPEN)
                    dop.core.sendConnect(node);
            }
        }
        function onclose() {
            dop.core.emitClose(node, socket);
            // If node.readyState === dop.CONS.CLOSE means node.disconnect() has been called and we DON'T try to reconnect
            if (node.readyState === dop.CONS.CLOSE)
                dop.core.emitDisconnect(node);
            // We setup node as reconnecting
            else if (node.readyState === dop.CONS.CONNECT) {
                node.timeoutReconnection = setTimeout(
                    dop.core.emitDisconnect.bind(this, node),
                    options.timeout*1000
                );
                node.readyState = dop.CONS.RECONNECT;
            }
        }


        // dop events
        function onconnect() {
            node.readyState = dop.CONS.CONNECT;
            dop.core.emitConnect(node);
        }
        function ondisconnect() {
            node.readyState = dop.CONS.CLOSE;
            socket.close();
        }


        // Setting up
        dop.core.setSocketToNode(node, socket);
        node.readyState = dop.CONS.OPEN;
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