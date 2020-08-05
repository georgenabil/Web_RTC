const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io").listen(server);
const { v4: uuidV4 } = require("uuid");
var ExpressPeerServer = require("peer").ExpressPeerServer;

var options = {};
app.use("/peerjs", ExpressPeerServer(server, { port: 3001, path: "/" }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/getroom", (req, res) => {
  res.redirect(`/join/${uuidV4()}`);
});

app.get("/join/:room", (req, res) => {
  console.log("that id is", req.params.room);
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});
server.listen(3000);
