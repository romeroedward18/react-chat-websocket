const { on } = require("nodemon");

const io = require("socket.io")(3001, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://react-chat-websocket.onrender.com",
    ],
  },
});

let userList = [];

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
    userList.push({ ...userData, messages: [] });
    console.log("send-subscribe");
    console.log(userList);
    socket.emit("receive-subscribe", userList);
    socket.broadcast.emit("receive-subscribe", userList);
  });

  socket.on("receive-subscribe", (userData) => {
    socket.join(userList.map((user) => user.id));
  });
});
