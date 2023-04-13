const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const cors = require('cors');

//socket 
const { Server } = require("socket.io");
const { setTimeout } = require('timers');
const io = new Server(server, {
  cors: {
    origin: "https://amigaapp-f2f93-default-rtdb.firebaseio.com",
    methods: ["GET", "POST","PATH"]
  }, origin: true, allowEIO3: true
});

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
// Servimos los archivos que se encuentran en el directorio public
app.use(express.static(path.join(__dirname, './public')));
app.get('/', (req, res) => {
  // Servimos los archivos que se encuentran en el directorio public
  /* res.sendFile(__dirname + '/index.html'); */
});



io.on('connection', (socket) => {
  console.log('a user connected');
  //MENSAJE DE BIENVENIDA.
  io.to(socket.id).emit('chat send server message', "Hola bienvenido al server");

  //EVENTO PARA TODAS LAS PERSONA CONECTADAS A LA SALA INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
  //socket.broadcast.to(data.sala).emit('chat send server message', data.mensaje)

  socket.on('disconnect', () => {
    console.log('user disconnected');

  });
  
  //EVENTO CUANDO ALGUIEN SE CONECTA A UNA SALA
 /*  io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
  });
  //EVENTO CUANDO SE CREAN SALAS.
  io.of("/").adapter.on("create-room", (room) => {
    var availableRooms = [];
    var rooms = io.sockets.adapter.rooms;
    if (rooms) {
      for (var room in rooms) {
        if (!rooms[room].hasOwnProperty(room)) {
          availableRooms.push(room);
        }
      }
    } */


    /* console.log(`room ${room} was created`); */
    //RESPUESTA A LOS USUARIO CONECTADO.
    //io.emit('send_list_rooms', { availableRooms });
  //});

  socket.on('join_room_sala', (data) => {
    console.log('message: ' + data.room);
    //CONEXION A UNA SALA EN ESPECIFICO.
    socket.join(data.room);


    //socket.broadcast.emit('hi');
    //LISTAR LAS SALAS.
    console.log(io.sockets.adapter.rooms)
    //RESPUESTA A LOS USUARIO CONECTADO.
    //io.emit('chat send server message', data);

    //EVENTO PARA TODAS LAS PERSONAS CONECTADAS A LA SALA EXCEPTO QUIEN ENVIA, INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
    //socket.broadcast.to(data.sala).emit('chat send server message', `Hola bienvenido a la sala ${data.sala}`)

    //EVENTO PARA TODAS LAS PERSONAS CONECTADAS A LA SALA, INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
    
    //socket.to(data.sala).emit('chat send server message', `Hola bienvenido a la sala ${data.sala}`)
    
    //BIENVENIDA A LA SALA
    io.to(socket.id).emit('server_message_rooms', `Hola bienvenido a la sala ${data.sala}`)

    setTimeout(() => {
      socket.to(data.sala).emit(`Hola a todos en la sala ${data.sala}`)
    }, 5000)

  });

  
  socket.on('data_gps', (data) => {
   
    //SUSCRIBE TO ROOM.
    console.log(data.sala)
    socket.join(data.sala);
    socket.broadcast.emit('hi');
    //LISTAR LAS SALAS.
    console.log(io.sockets.adapter.rooms)


    //RESPUESTA A LOS USUARIO CONECTADO.
    //io.emit('chat send server message', data);
    //EVENTO PARA TODAS LAS PERSONAS CONECTADAS A LA SALA EXCEPTO QUIEN ENVIA, INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
    //socket.broadcast.to(data.sala).emit('chat send server message', `Hola bienvenido a la sala ${data.sala}`)
    //EVENTO PARA TODAS LAS PERSONAS CONECTADAS A LA SALA, INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
    //socket.to(data.sala).emit('chat send server message', `Hola bienvenido a la sala ${data.sala}`)
   

  });

  //EVENTO PARA ENVIAR INFORMACION DE LAS RUTAS.
  socket.on('geo_posicion', (msg) => {
    console.log('objectposition: ' + msg.room);
    //socket.broadcast.emit('hi');
    //EVENTO PARA TODAS LAS PERSONA CONECTADAS A LA SALA INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
    socket.broadcast.to(msg.room).emit('chat_send_server_message', msg.data)
    
    //SI VAMOS A ENVIAR LA INFORMACION A TODOS.
    /*io.emit('chat send server message', msg.data);
    io.emit('chat_send_server_message', msg.data);*/
  });
});

server.listen(process.env.PORT || 8000, () => {
  console.log('listening on http://localhost:8000');
});
