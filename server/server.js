const { on } = require("nodemon");
const cors = require("./corsConfig");

const io = require("socket.io")(3001, {
  cors,
});

// Almacena la lista de usuarios en el servidor
let userList = {};

io.on("connection", (socket) => {
  console.log("connection: " + socket.id);

  // Cuando se recibe un mensaje "send-message", se envía el mensaje a la sala específica del chat activo
  socket.on("send-message", (msgObj, room) => {
    console.log("send-message");
    console.log(`msgObj: ${msgObj} room: ${room}`);
    if (room) {
      socket.to(room).emit("receive-message", msgObj);
    }
  });

  // Cuando se recibe un mensaje "send-subscribe" guardar la información del usuario en la lista de usuarios
  socket.on("send-subscribe", (userData) => {
    userList[userData.id] = { ...userData, messages: [] };
    console.log("send-subscribe");
    console.log(userList);
    // Se envía un mensaje "receive-subscribe" con la lista de usuarios conectados en el servidor
    socket.emit("receive-subscribe", userList);
    socket.broadcast.emit("receive-subscribe", userList);
  });

  // Cuando se recibe un mensaje "receive-subscribe" se itera sobre el id de los usuarios conectados y los une a las salas disponbles
  socket.on("receive-subscribe", () => {
    socket.join(userList.map((user) => user.id));
    console.log(userList);
  });

  socket.on("disconnect", () => {
    console.log(`disconnect: ${socket.id}`);
    // Elimina al usuario de la lista de usuarios y envía el mensaje "receive-subscribe" con la lista de usuarios actualizada
    delete userList[socket.id];
    socket.broadcast.emit("receive-subscribe", userList);
  });
});
