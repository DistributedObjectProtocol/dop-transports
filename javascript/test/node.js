let dop = require('dop');
let socketio = require('dop-transports').connect.socketio;
let sockjs = require('dop-transports').connect.sockjs;


let node = dop.connect();

node.on('open', ()=>{console.log('websockets opened')})
node.on('message', (socket, message)=>console.log('websockets message', message))
node.on('close', ()=>console.log('websockets closed'))
node.send('nodejs: start!');
// setInterval(()=>{node.send('nodejs: ' + new Date().toString())}, 5000)


// let node2 = dop.connect({transport:socketio})
// node2.on('open', ()=>console.log('socketio opened'))
// node2.on('message', (socket, message)=>console.log('socketio message', message))
// node2.on('close', ()=>console.log('socketio closed'))
// node2.send('nodejs: start!');
// setInterval(()=>{node2.send('nodejs: ' + new Date().toString())}, 5000)


// let node3 = dop.connect({transport:sockjs})
// node3.on('open', ()=>console.log('sockjs opened'))
// node3.on('message', (socket, message)=>console.log('sockjs message', message))
// node3.on('close', (err)=>console.log('sockjs closed'))
// node3.send('nodejs: start!');
// setInterval(()=>{node3.send('nodejs: ' + new Date().toString())}, 5000)
