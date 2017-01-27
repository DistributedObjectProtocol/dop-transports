// https://github.com/sockjs/sockjs-node
function sockjs(dop, listener, options) {
        
    if (options.server !== undefined && options.httpServer === undefined)
        options.httpServer = options.server;

    if (typeof options.httpServer == 'undefined') {
        options.httpServer = require('http').createServer();
        options.httpServer.listen((typeof options.port != 'number') ? 4446 : options.port, '0.0.0.0');
    }

    if (typeof options.prefix != 'string')
        options.prefix = (typeof options.namespace == 'string') ? options.namespace : '/'+dop.name;

    if (options.prefix[0] != '/')
        options.prefix = '/'+options.prefix;

    if (typeof options.timeout != 'number') // Default timeout we use to disconnect node/client definitely
        options.timeout = 60; // seconds

    var api = options.transport.getApi(),
        transport = new api.createServer(options),
        closed = false,
        clients = {};

    transport.installHandlers( options.httpServer, options );

    // Listening for sockets connections
    transport.on('connection', function(socket) {

        function send(message) {
            // console.log( message, socket.readyState===OPEN );
            (socket.readyState===OPEN) ?
                socket.write(message)
            :
                client.queue.push(message); 
        }
        function sendQueue() {
            while (client.queue.length>0)
                socket.write(client.queue.shift());
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
            socket.removeListener('data', onmessage);
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
        socket.on('data', onmessage);
        socket.on('close', onclose);

    });

    // var close = transport.close;
    transport.close = function() {
        closed = true;
        for (var token in clients) {
            clearTimeout(clients[token].timeoutReconnection);
            clients[token].socket.close();
        }
        // close.call(transport);
    };

    return transport;
};

// Cons
var CLOSE = 0,
    OPEN = 1,
    CONNECTING = 2,
    CONNECT = 3;


sockjs.getApi = function() { return require('sockjs') };
module.exports = sockjs;