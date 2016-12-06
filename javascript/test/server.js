// var fs = require('fs');
// var http = require('http');
// var httpServer = http.createServer(function (req, res) {
//     if (req.url === '/') {
//         res.writeHead(200, {'Content-Type': 'text/html'});
//         res.end('<script type="text/javascript" src="browser.js"></script>');
//     }
//     else {
//         res.writeHead(200, { 'Content-Type': 'text/javascript' });
//         res.end(fs.readFileSync('/Users/enzo/Copy/projects/dop/dop/dist/browser.js'), 'utf-8');
//     }
// })
// httpServer.listen(1234);


dop = require('../../../dop/dist/nodejs');
socketiotransport = require('../nodejs.js').listen.socketio;
sockjstransport = require('../nodejs.js').listen.sockjs;
uwstransport = require('../nodejs.js').listen.uws;

websocket = dop.listen();
websocket.on('open', onopen);
websocket.on('message', onmessage);
websocket.on('close', onclose);
websocket.on('connect', onconnect);
websocket.on('disconnect', ondisconnect);
dop.onsubscribe(onsubscribe);


// socketio = dop.listen({transport:socketiotransport});
// socketio.on('open', onopen);
// socketio.on('message', onmessage);
// socketio.on('close', onclose);
// socketio.on('connect', onconnect);


// sockjs = dop.listen({transport:sockjstransport});
// sockjs.on('open', onopen);
// sockjs.on('message', onmessage);
// sockjs.on('close', onclose);
// sockjs.on('connect', onconnect);



function onopen(socket) {
    console.log( 'onopen', this.options.transport.name);
}
function onmessage(socket, message) {
    console.log( 'onmessage', this.options.transport.name, message);
}
function onclose(socket) {
    console.log( 'onclose', this.options.transport.name);
}
function onconnect(node, token) {
    console.log( 'onconnect', node.transport.name );
}

