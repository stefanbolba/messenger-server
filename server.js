const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

const socketio = require('socket.io');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! SHUTTING DOWN!');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection succesful');
  });

const port = process.env.PORT || 3000;
const server = http.createServer(app);
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

const io = socketio(server, {
  cors: {
    origin: ['https://messenger-app-rn.herokuapp.com/'],
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`User with the id: ${socket.id} has connected!`);
  let userId;
  let userName;

  socket.on('login', (userInfo) => {
    socket.broadcast.emit('active_user', userInfo);
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit('logout', { id: userId, name: userName });
  });

  //Socket for receving messages from client
  socket.on('send_message', (receivedMessage) => {
    const { room } = receivedMessage;
    socket.join(room);
    socket.to(room).emit('receive_message', receivedMessage);
  });
  socket.on('message_seen', ({ room }) => {
    console.log(room);
    //, messageId, createdBy, connection
    socket.to(room).emit('add_message_seen', { room });
  });
});

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! SHUTTING DONW!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
