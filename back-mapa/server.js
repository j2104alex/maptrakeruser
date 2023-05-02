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
    origin: (origin, callback) => {
      const whitelist = ["https://amigaapp-f2f93-default-rtdb.firebaseio.com","http://localhost:8001","http://localhost:8000"];
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATH"]
  }, origin: true, allowEIO3: true
});

/* app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

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

app.use(cors()); */
// Servimos los archivos que se encuentran en el directorio public
app.use(express.static(path.join(__dirname, './public')));
app.get('/', (req, res) => {
  // Servimos los archivos que se encuentran en el directorio public
  res.sendFile(__dirname + '/index.html');
});


//save user connection to server
const users = [];
//Return list user by room
let usersIds = [];

io.on('connection', (socket) => {
  console.log('a user connected');
  //MENSAJE DE BIENVENIDA.(privado)
  io.to(socket.id).emit('chat send server message', "Hola bienvenido al server");

  //DETECT USER DESCONECT
  socket.on('disconnect', () => {
    console.log('user disconnected');

  });


  socket.on('leave room', (room) => {
    socket.leave(room);
    console.log(`Usuario ${socket.id} abandonó la sala ${room}`);
  });

  socket.on('disconnecting', () => {
    if (usersIds.length > 0) {
      usersIds = usersIds.filter((id) => {
        return id != socket.id
      })
      console.log(usersIds);
    }
    //SEND NEW LIST USER connection
    socket.broadcast.emit('send_list_users', { usersIds });
    console.log(`Usuario ${socket.id} está abandonando la sala`)

  });

  //EVENT RETURN ON CREATE ROOM
  io.of("/").adapter.on("create-room", (room) => {
    //console.log(`room ${room} was created`);

    // Get all rooms in socket
    const rooms = io.sockets.adapter.rooms;

    const availableRooms = []

    // Loop through all rooms and print out their details
    rooms.forEach((valor, key) => {

      if (key.includes('Ruta')) {
        //console.log(valor, key)
        availableRooms.push([key])
      }
    });

    //IMPORTANT
    //THIS NOT EVENT IMPLEMENTS FOR SEND ROOM ENDABLES

  });


  //EVENTO CUANDO ALGUIEN SE CONECTA A UNA SALA
  io.of("/").adapter.on("join-room", (room, id) => {

    //RESPUESTA A LOS USUARIO CONECTADO.
    //io.emit('chat send server message', data);

    //EVENTO PARA TODAS LAS PERSONAS CONECTADAS A LA SALA EXCEPTO QUIEN ENVIA, INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
    //socket.broadcast.to(data.sala).emit('chat send server message', `Hola bienvenido a la sala ${data.sala}`)

    //EVENTO PARA TODAS LAS PERSONAS CONECTADAS A LA SALA, INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS

    //socket.to(data.sala).emit('chat send server message', `Hola bienvenido a la sala ${data.sala}`)


  });


  /**
   * EVENT SEND MESSAGE USERS BY ROOMS
   */
  socket.on('chat_send_message', (data) => {
    // to all clients in room
    io.in(data.route).emit("message_chat", data.message);
  })

  //GET DATA TRAKER ROUTE 
  socket.on('data_gps', (data) => {

    //SUSCRIBE TO ROOM.
    socket.join(data.sala);

    //SEND USER CONNECT TO ROOM.
    const usersInRoom = io.sockets.adapter.rooms.get(data.sala);
    //console.log("usersInRoom", usersInRoom)

    if (usersInRoom) {
      usersIds = Array.from(usersInRoom.keys());
      console.log('Users in room:', usersIds);
    }

    // to all clients in room
    io.in(data.sala).emit('send_list_users', { usersIds });
    //console.log(`Usuario ${socket.id} se unió a la sala ${data.sala}`);



    //RESPUESTA A LOS USUARIO CONECTADO.
    //io.emit('chat send server message', data);
    //EVENTO PARA TODAS LAS PERSONAS CONECTADAS A LA SALA EXCEPTO QUIEN ENVIA, INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
    //socket.broadcast.to(data.sala).emit('chat send server message', `Hola bienvenido a la sala ${data.sala}`)
    //EVENTO PARA TODAS LAS PERSONAS CONECTADAS A LA SALA, INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
    //socket.to(data.sala).emit('chat send server message', `Hola bienvenido a la sala ${data.sala}`)


  });

  //EVENTO PARA ENVIAR INFORMACION DE LAS RUTAS.
  socket.on('geo_posicion', (msg) => {
    /* console.log('objectposition: ' + msg.room); */
    //socket.broadcast.emit('hi');
    //EVENTO PARA TODAS LAS PERSONA CONECTADAS A LA SALA INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
    socket.broadcast.to(msg.room).emit('chat_send_server_message', msg)//solo a los de la sala

    //SI VAMOS A ENVIAR LA INFORMACION A TODOS
    //io.emit('chat_send_server_message', msg)

  });
});

server.listen(process.env.PORT || 8000, () => {
  console.log('listening on http://localhost:8000');
});
