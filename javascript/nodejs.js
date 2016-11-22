
module.exports = {
    connect: {
        websocket: require('./connect/websocket'),
        socketio: require('./connect/socketio')
    },
    listen: {
        websocket: require('./listen/websocket'),
        socketio: require('./listen/socketio')
    }
};