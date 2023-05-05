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

// ---------------- SOCKET.IO ----------------- //
//save user connection to server
const users = [];
//Return list user by room
let usersIds = [];
//RTUEN list user by room enabled
let availableRooms = []
let usersGPSdata = []

const eventsSocketio = {
  SERVER_MESSAGE: 'chat send server message',
  SERVER_SEND_LIST_USERS: 'send_list_users',
  GET_CHAT_MESSAGE: 'chat_send_message',
  SEND_CHAT_MENSSAGE: 'message_chat',
  GET_USER_GPS_DATA: 'geo_posicion',
  SEND_USER_GPS_DATA: 'chat_send_server_message',
  USER_CONECT_ROOM_SERVER: 'user_conect_room_serve',
  CHECK_LENGTH_USER_CONECT_ROOM_GPS: 'check_length_users_route_gps',
  MESSAGE_PRIVATE_USER: 'route_message_user'
}


io.on('connection', (socket) => {
  console.log('a user connected');
  //MENSAJE DE BIENVENIDA.(privado)
  io.to(socket.id).emit(eventsSocketio.SERVER_MESSAGE, "Hola bienvenido al server");

  //DETECT USER DESCONECT
  socket.on('disconnect', () => {
    console.log('user disconnected');

  });


  socket.on('leave room', (room) => {
    socket.leave(room);

  });

  socket.on('disconnecting', (room) => {
    console.log(`Usuario ${socket.id} está abandonando la sala`)
    if (usersIds.length > 0) {
      usersIds = usersIds.filter((id) => {
        return id != socket.id
      })
      console.log(usersIds);
    }
    //SEND NEW LIST USER connection
    socket.broadcast.emit(eventsSocketio.SERVER_SEND_LIST_USERS, { room: room, usersIds });
  });

  /**
   * EVENT SEND MESSAGE USERS BY ROOMS
   */
  socket.on(eventsSocketio.GET_CHAT_MESSAGE, (data) => {
    // to all clients in room
    io.in(data.route).emit(eventsSocketio.SEND_CHAT_MENSSAGE, data.message);
  })



  //EVENTO PARA ENVIAR INFORMACION DE LAS RUTAS.
  socket.on(eventsSocketio.GET_USER_GPS_DATA, (data) => {
    //EVENTO PARA TODAS LAS PERSONAS CONECTADAS A LA SALA.
    socket.broadcast.to(data.room).emit(eventsSocketio.SEND_USER_GPS_DATA, data)//solo a los de la sala

    //SI VAMOS A ENVIAR LA INFORMACION A TODOS
    //io.emit('chat_send_server_message', msg)
  });

  //EVENTO PARA DETECTAR LOS USUARIOS CONECTADOS A LA MISMA SALA
  socket.on(eventsSocketio.USER_CONECT_ROOM_SERVER, (data) => {
    //SUSCRIBE TO ROOM USER FROM GPS PAGE.
    socket.join(data.room);

    //console.log(io.sockets.adapter.rooms)

    //SEND USER CONNECT TO ROOM.
    const usersInRoom = io.sockets.adapter.rooms.get(data.room);


    if (usersInRoom) {
      usersIds = Array.from(usersInRoom.keys());

    }

    // to all clients in room
    io.in(data.room).emit(eventsSocketio.SERVER_SEND_LIST_USERS, { room: data.room, usersIds });

  })

  //EVENTO PARa validar  cantidad de usuarios transmitiendo
  socket.on(eventsSocketio.CHECK_LENGTH_USER_CONECT_ROOM_GPS, (roomData) => {


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
      io.to(usersIdroom.slice(1)).emit(eventsSocketio.MESSAGE_PRIVATE_USER, { status: true, message: `La ${roomData.room.replace("_", " ")} ya esta monitoreada, sera conectado al servidor. pero no se enviara la informacion.` })
      //DESCONECTAMOS AL USUARIO PARA LIBERAR RECURSOS
      //socket.disconnect()
    } else {
      io.to(socket.id).emit(eventsSocketio.MESSAGE_PRIVATE_USER, { status: false, message: `` })
    }
  })
});

// ------------------ END SOCKET.IO --------------------------------//

server.listen(process.env.PORT || 8000, () => {
  console.log('listening on http://localhost:8000');
});
