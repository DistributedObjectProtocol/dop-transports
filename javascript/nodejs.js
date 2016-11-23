
module.exports = {
    connect: {
        websocket: (function() {
            var transport = require('./connect/websocket');
            transport.api = require('ws');
            return transport;
        })(),
        socketio: require('./connect/socketio'),
        sockjs: require('./connect/sockjs')
    },
    listen: {
        websocket: require('./listen/websocket'),
        socketio: require('./listen/socketio'),
        sockjs: require('./listen/sockjs')
    }
};