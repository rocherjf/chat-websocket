// Setup basic express server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  let addedUser = false;

  // when the client emits 'new message', we broadcast it to others
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      userName: socket.userName,
      message: data,
    });
  });

  // when the client emits 'add user'
  socket.on('add user', (userName) => {
    if (addedUser) return;

    // we store the userName in the socket session for this client
    socket.userName = userName;

    users.push(userName);
    addedUser = true;

    // we broadcast that a person has connected to others
    socket.broadcast.emit('user joined', {
      userName: socket.userName,
      users: users,
    });
  });

  // when one client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      userName: socket.userName,
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      userName: socket.userName,
    });
  });

  // when the client emits 'disconnects'
  // -> we update the nb of users and broadcast it to others
  socket.on('disconnect', () => {
    if (addedUser) {
      users = removeItemOnce(users, socket.userName);

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        userName: socket.userName,
        users: users,
      });
    }
  });
});

/**
 * Retire du tableau fournit en entrée, le paramètre fournit en entrée si il est présent.
 * @param {Array} arr
 * @param {*} value - valeur à retirer du tableau
 * @return {Array}
 */
function removeItemOnce(arr, value) {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}
