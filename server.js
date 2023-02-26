const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);

//socket 
const { Server } = require("socket.io");
const io = new Server(server);

// Servimos los archivos que se encuentran en el directorio public
app.use(express.static(path.join(__dirname, './public')));
app.get('/', (req, res) => {
  // Servimos los archivos que se encuentran en el directorio public
  /* res.sendFile(__dirname + '/index.html'); */
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    //socket.broadcast.emit('hi');
    io.emit('chat send server message', msg);
  });
  socket.emit('text', 'wow. such event. very real time.');
});



server.listen(process.env.PORT || 5000, () => {
  console.log('listening on http://localhost:5000');
});
