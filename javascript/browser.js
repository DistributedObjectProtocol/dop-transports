
module.exports = {
    connect: {
        websocket: require('./connect/websocket'),
        socketio: require('./connect/socketio'),
        sockjs: require('./connect/sockjs'),
        local: require('./connect/local')
    },
    listen: {
        local: require('./listen/local')
    }
};