// http://socket.io/docs/server-api/
var listenSocketio = function socketio(dop, listener, options) {

    var transport = new options.transport.api( options.httpServer, options );

    if (typeof options.httpServer == 'undefined')
        transport.listen((typeof options.port != 'number') ? 4445 : options.port);

    transport
    .of((typeof options.namespace != 'string') ? dop.name : options.namespace)
    .on('connection', function( socket ){

        socket.send = listenSocketio.send;

        socket.close = listenSocketio.close;

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

listenSocketio.send = function( data ) {
    this.emit('message', data);
};
listenSocketio.close = function( ) {
    this.disconnect();
};

listenSocketio.api = require('socket.io');

module.exports = listenSocketio;

