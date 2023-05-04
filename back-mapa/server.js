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
      const whitelist = ["https://amigaapp-f2f93-default-rtdb.firebaseio.com", "http://localhost:8001", "http://localhost:8000"];
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

app.use(cors());
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
let availableRooms = []
let usersGPSdata = []
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
    if (usersIds.length > 0) {
      usersIds = usersIds.filter((id) => {
        return id != socket.id
      })
      console.log(usersIds);
    }
    //SEND NEW LIST USER connection
    socket.broadcast.emit('send_list_users', { room: room, usersIds });
  });

  socket.on('disconnecting', () => {

    console.log(`Usuario ${socket.id} está abandonando la sala`)
    
    
  });




  /**
   * EVENT SEND MESSAGE USERS BY ROOMS
   */
  socket.on('chat_send_message', (data) => {
    // to all clients in room
    io.in(data.route).emit("message_chat", data.message);
  })



  //EVENTO PARA ENVIAR INFORMACION DE LAS RUTAS.
  socket.on('geo_posicion', (data) => {
    
     
    //EVENTO PARA TODAS LAS PERSONA CONECTADAS A LA SALA INFORMANDO LA LISTA DE LOS USUARIOS CONECTADOS
    socket.broadcast.to(data.room).emit('chat_send_server_message', data)//solo a los de la sala

    //SI VAMOS A ENVIAR LA INFORMACION A TODOS
    //io.emit('chat_send_server_message', msg)
  });

  //EVENTO PARA CONECTAR EL USUARIO AL SERVIDOR
  socket.on('user_conect_room_serve', (data) => {
    //SUSCRIBE TO ROOM USER FROM GPS PAGE.
    socket.join(data.room);

    console.log(io.sockets.adapter.rooms)

    //SEND USER CONNECT TO ROOM.
    const usersInRoom = io.sockets.adapter.rooms.get(data.room);
    

    if (usersInRoom) {
      usersIds = Array.from(usersInRoom.keys());
      
    }

    // to all clients in room
    io.in(data.room).emit('send_list_users', { room: data.room, usersIds });
    
  })

  //EVENTO PARa validar  cantidad de usuarios transmitiendo
  socket.on('check_length_users_route_gps', (roomData) => {
    

    socket.join(roomData.room);

    let validateroom = availableRooms.findIndex((room) => {
      return room.id === roomData.room
    });

    
    if (validateroom == -1) {
      availableRooms = [{ id: roomData.room }, ...availableRooms]

    }

    const usersInRoom = io.sockets.adapter.rooms.get(roomData.room);

    let usersIdroom = Array.from(usersInRoom)

    if (usersIdroom.length > 1) {
      //notificamos solo al usuario conectado y enlazado a la misma ruta que ya estan monitoreando esa ruta.
      io.to(usersIdroom.slice(1)).emit("route_message_user", { status: true, message: `La ${roomData.room.replace("_", " ")} ya esta monitoreada, sera conectado al servidor. pero no se enviara la informacion.` })
      //DESCONECTAMOS AL USUARIO PARA LIBERAR RECURSOS
      //socket.disconnect()
    } else {
      io.to(socket.id).emit("route_message_user", { status: false, message: `` })
    }
  })
});


server.listen(process.env.PORT || 8000, () => {
  console.log('listening on http://localhost:8000');
});
