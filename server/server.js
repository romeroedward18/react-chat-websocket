const { on } = require("nodemon");
const cors = require("./corsConfig");

const io = require("socket.io")(3001, {
  cors,
});

let userList = {};

io.on("connection", (socket) => {
  console.log("connection: " + socket.id);
  socket.on("send-message", (msgObj, room) => {
    console.log("send-message");
    console.log(`msgObj: ${msgObj} room: ${room}`);
    if (room) {
      socket.to(room).emit("receive-message", msgObj);
    }
  });

  socket.on("send-subscribe", (userData) => {
    userList[userData.id] = { ...userData, messages: [] };
    console.log("send-subscribe");
    console.log(userList);
    socket.emit("receive-subscribe", userList);
    socket.broadcast.emit("receive-subscribe", userList);
  });

  socket.on("receive-subscribe", (userData) => {
    socket.join(userList.map((user) => user.id));
    console.log(userList);
  });

  socket.on("disconnect", () => {
    delete userList[socket.id];
  });
});
