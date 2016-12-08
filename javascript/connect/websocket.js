(function(root){
function websocket(dop, node, options) {

    var url = 'ws://localhost:4444/'+dop.name,
        args = arguments;

    if (typeof options.url == 'string')
        url = options.url.replace('http','ws');
    else if (typeof window!='undefined' && /http/.test(window.location.href)) {
        var domain_prefix = /(ss|ps)?:\/\/([^\/]+)\/?(.+)?/.exec(window.location.href),
            protocol = domain_prefix[1] ? 'wss' : 'ws';
        url = protocol+'://'+domain_prefix[2].toLocaleLowerCase()+'/'+dop.name;
    }


    var api = options.transport.getApi(),
        socket = new api(url),
        send_queue = [];
    

    // We use this function as alias to store messages when connection is not OPEN
    function send(message) {
        if (node.readyState === dop.CONS.RECONNECT) {
            // console.log( 'send', message );
            socket.send(message);
        }
        else {
            // console.log( 'save', message ); 
            send_queue.push(message);
        }
    }
    function sendQueue(message) {
        while (send_queue.length>0)
            socket.send(send_queue.shift());
    }

    node.readyState = dop.CONS.CLOSE;
    node.reconnect = function() {
        oldSocket = socket;
        node.socket = socket = new api(url);
        node.socket.addEventListener('open', onopen);
        node.socket.addEventListener('message', onmessage);
        node.socket.addEventListener('close', onclose);
        node.readyState = dop.CONS.RECONNECT;
    };
    node.once(dop.CONS.CONNECT, function() {
        node.readyState = dop.CONS.CONNECT;
        dop.core.emitConnect(node);
    });
    node.on(dop.CONS.SEND, function(message) {
        send(message);
    });
    node.on(dop.CONS.DISCONNECT, function() {
        node.readyState = dop.CONS.CLOSE;
        socket.close();
    });

    function onopen() {
        // Reconnect
        if (node.readyState === dop.CONS.RECONNECT) {
            socket.send(node.tokenServer);
            sendQueue();
        }
        // Connect
        else {
            socket.send(); // Empty means we want to get connected
            node.readyState = dop.CONS.OPEN;
        sendQueue();
        }
        dop.core.emitOpen(node, socket, options.transport);
    }
    function onmessage(message) {
        // Reconnecting
        if (message.data===node.tokenServer && node.readyState===dop.CONS.RECONNECT) {
            node.readyState = dop.CONS.CONNECT;
            dop.core.emitReconnectClient(node, oldSocket);
            sendQueue();
        }
        else
            dop.core.emitMessage(node, socket, message.data, message);
    }
    function onclose() {
        dop.core.emitClose(node, socket);
    }

    socket.addEventListener('open', onopen);
    socket.addEventListener('message', onmessage);
    socket.addEventListener('close', onclose);


    return socket;
};

if (typeof dop=='undefined' && typeof module == 'object' && module.exports)
    module.exports = websocket;
else {
    websocket.getApi = function() { return window.WebSocket };
    (typeof dop != 'undefined') ?
        dop.transports.connect.websocket = websocket
    :
        root.dopTransportsConnectWebsocket = websocket;
}

})(this);