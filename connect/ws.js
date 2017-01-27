// https://github.com/websockets/ws
var connectWebsocket = require('./websocket');
function ws() {
    return connectWebsocket.apply(this, arguments);
};

ws.getApi = function() { 
    var api = require('ws');
    api.prototype.removeEventListener = api.prototype.removeListener;
    return api;
};
module.exports = ws;
