// https://github.com/uWebSockets/uWebSockets
var listenWs = require('./ws');
var listenUws = function uws() {
    return listenWs.apply(this, arguments);
};

listenUws.api = function() {
    return require('uws').Server;
};
module.exports = listenUws;
