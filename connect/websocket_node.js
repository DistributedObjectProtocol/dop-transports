// https://github.com/websockets/ws
var connectWebsocket = require('./websocket')
function websocket() {
    return connectWebsocket.apply(this, arguments)
}

websocket.getApi = function() {
    return require('ws')
}
module.exports = websocket
