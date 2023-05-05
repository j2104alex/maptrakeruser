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


app.use(cors());

// Servimos los archivos que se encuentran en el directorio public
app.use(express.static(path.join(__dirname, './public')));
app.get('/', (req, res) => {
  // Servimos los archivos que se encuentran en el directorio public
  res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 8001, () => {
  console.log('listening on http://localhost:8001');
});
