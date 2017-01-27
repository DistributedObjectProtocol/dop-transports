// https://github.com/uWebSockets/uWebSockets
var listenWs = require('./ws');
function uws() {
    return listenWs.apply(this, arguments);
};

uws.getApi = function() { return require('uws').Server };
module.exports = uws;
