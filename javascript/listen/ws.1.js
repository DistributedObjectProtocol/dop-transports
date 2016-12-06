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
    

    // Creating instance of the (let WebSocketServer = new WebSocketServer() https://github.com/websockets/ws)
    var api = options.transport.api(),
        transport = new api(options);

    
    // Listening for new raw connections
    transport.on('connection', function(socket) {

        var node = dop.core.onOpenServer(listener, socket, options.transport),
            send_queue = [];

        // We use this function as alias to store sends when connection is not OPEN
        function send(message) {
            (socket.readyState === socket.constructor.OPEN) ? socket.send(message) : send_queue.push(message);
        }

        node.readyState = dop.CONS.OPEN;
        node.once('connect', function() {
            node.readyState = dop.CONS.CONNECT;
        });
        node.on('send', function(message) {
            send(node.tokenServer);
        });
        node.on('close', function() {
            node.readyState = dop.CONS.CLOSE;
            socket.close();
        });


        socket.on('message', function(message) {
            // Checking if client is trying to reconnect
            var oldNode = dop.data.node[message];
            if (oldNode != undefined && oldNode.readyState === dop.CONS.RECONNECT && node.readyState === dop.CONS.OPEN) {
                node.readyState = dop.CONS.CLOSE;
                oldNode.readyState = dop.CONS.CONNECT;
                clearTimeout(oldNode.timeoutReconnection);
                delete oldNode.timeoutReconnection;
                dop.core.onReconnectServer(listener, oldNode, node);
                send.call(socket, message);
                while (send_queue.length>0)
                    send(send_queue.shift());
            }
            else
                dop.core.onMessageServer(listener, socket, message);
        });
        socket.on('close', function() {
            dop.core.onCloseServer(listener, socket);
            // If node.readyState === dop.CONS.CLOSE means node.disconnect() has been called and we DON'T try to reconnect
            if (node.readyState === dop.CONS.CLOSE)
                dop.core.onDisconnectServer(listener, socket);
            // We setup node as reconnecting
            else if (node.readyState === dop.CONS.CONNECT) {
                node.timeoutReconnection = setTimeout(dop.core.onDisconnectServer.bind(this, listener, socket), options.timeout*1000);
                node.readyState = dop.CONS.RECONNECT;
            }
        });

    });

    return transport;
};

ws.api = function() { return require('ws').Server };
module.exports = ws;