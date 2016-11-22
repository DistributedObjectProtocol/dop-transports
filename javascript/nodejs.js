
module.exports = {
    connect: {
        websocket: (function() {
            var transport = require('./connect/websocket');
            transport.api = require('ws');
            return transport;
        })(),
        socketio: require('./connect/socketio')
    },
    listen: {
        websocket: require('./listen/websocket'),
        socketio: require('./listen/socketio')
    }
};