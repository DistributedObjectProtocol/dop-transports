module.exports = {
    connect: {
        websocket: require('./connect/websocket'),
        ws: require('./connect/ws')
    },
    listen: {
        ws: require('./listen/ws')
    }
}
