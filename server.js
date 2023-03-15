const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);

//socket 
const { Server } = require("socket.io");
const io = new Server(server,{ cors: true, origin:true, allowEIO3: true });

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
  socket.emit('mensaje_bienvenida', "bienvenido usuario")
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    //socket.broadcast.emit('hi');
    io.emit('chat send server message', msg);
  });
  socket.emit('text', 'wow. such event. very real time.');

  //EVENTO PARA ENVIAR INFORMACION DE LAS RUTAS.
  socket.on('geo_posicion', (msg) => {
    console.log('objectposition: ' + msg);
    //socket.broadcast.emit('hi');
    io.emit('chat send server message', msg);
    io.emit('chat_send_server_message', msg);
  });
});



server.listen(process.env.PORT || 5000, () => {
  console.log('listening on http://localhost:5000');
});
