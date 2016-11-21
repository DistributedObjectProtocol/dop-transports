// http://socket.io/docs/server-api/
var listenSocketio = function(dop, listener, options) {

    options.connector = options._connector; // Need it because socketio accept the option connector as parameter natively

    var transport = new synko.socketio.api( options.httpServer, options );

    if (typeof options.httpServer == 'undefined') {

        if (typeof options.port != 'number')
            options.port = synko.port;

        transport.listen( options.port );

    }

    transport.of( options.namespace ).on('connection', function( socket ){

        user.send = listenSocketio.send;

        user.close = listenSocketio.close;

        dop.core.onopen(listener, socket, options.transport);

        user.on('message', function(message){
            dop.core.onmessage(listener, socket, message);
        });

        user.on('disconnect', function(){
            dop.core.onclose(listener, socket);
        });

    });

    return transport;
};

listenSocketio.api = require('socket.io');

listenSocketio.send = function( data ) {
    this.emit('message', data);
};
listenSocketio.close = function( ) {
    this.disconnect();
};


module.exports = listenSocketio;

