// https://github.com/socketio/socket.io
var listenSocketio = function socketio(dop, listener, options) {

    if (options.server !== undefined && options.httpServer === undefined)
        options.httpServer = options.server;

    var api = options.transport.api(),
        transport = new api( options.httpServer, options );

    if (typeof options.httpServer == 'undefined')
        transport.listen((typeof options.port != 'number') ? 4445 : options.port);

    transport
    .of((typeof options.namespace != 'string') ? dop.name : options.namespace)
    .on('connection', function( socket ){

        socket.send = function(message) {
            socket.emit('message', message);
        };;

        socket.close = function( ) {
            socket.disconnect();
        };;

        dop.core.onopen(listener, socket, options.transport);

        socket.on('message', function(message){
            dop.core.onmessage(listener, socket, message);
        });

        socket.on('disconnect', function(){
            dop.core.onclose(listener, socket);
        });
    });

    return transport;
};

listenSocketio.api = function() {
    return require('socket.io');
};

module.exports = listenSocketio;