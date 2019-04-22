module.exports = {
    connect: {
        websocket: require('./connect/websocket_node')
    },
    listen: {
        websocket: require('./listen/websocket')
    }
}
