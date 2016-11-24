// https://github.com/websockets/ws
var connectWebsocket = require('./websocket');
var connectWs = function ws() {
    return connectWebsocket.apply(this, arguments);
};

connectWs.api = function() { 
    return require('ws');
};
module.exports = connectWs;
